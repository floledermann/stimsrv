<div align="center">

<h1>stimsrv <br> A System for Distributed User Studies and Behavioural Experiments</h1>


<a href="#defining--running-experiments">Running&nbsp;Experiments</a> ·
<a href="#experiment-results">Experiment&nbsp;results</a> ·
<a href="#device-configuration--roles">Device&nbsp;configuration&nbsp;&amp;&nbsp;roles</a> ·
<a href="#implementing-tasks">Implementing&nbsp;tasks</a> ·
<a href="#design-philosophy--terminology">Philosophy&nbsp;&amp;&nbsp;Terminology</a> ·
<a href="#license-credits--acknowledgements">License&nbsp;&amp;&nbsp;Credits</a>
</div>

----

stimsrv (***stim***ulus ***s***e***rv***er) is a system for running user studies and psychological experiments, potentially across multiple devices.

! | This is alpha version software – everything may still change without prior notice | !
--|-----------------------------------------------------------------------------------|--

Main features:

- Implemented in JavaScript, leveraging a modern, function-based programming style and supporting seamless transition from server to client code.
- Distributed experiments with multiple devices fulfilling different roles. For example, stimulus presentation can be performed by a desktop computer and participant feedback can be entered on a tablet connected by WiFi.
- Central control of experiment state and unidirectional data flow ensure deterministic experiment behaviour even in complex, distributed settings.
- Provides utilities that help to develop new experiment tasks with very little code, allowing researchers to focus on the core functionality (e.g. rendering the stimulus, order of stimuli etc.).
- Timestamp synchronization between multiple clients accomplishes temporal precision of a few milliseconds in local WiFi networks.
- Adaption of experiments to the device context, e.g. converting real-world measurements (millimeters, angular arcs) into appropriate pixel values depending on device-specific configuration of display resolution and viewing distance.
- Follows the design principle of “Simple things should be simple, complex things should be possible.” (Alan Kay)

To try out stimsrv, check out the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples). To implement your own experiment, you can start with the [stimsrv experiment template](https://github.com/floledermann/stimsrv-experiment-template).

*Important Note: While stimsrv experiments run in a web browser, currently its code is not audited for hosting publicly accessible online experiments. Stimsrv is currently intended for local use in private (lab) networks only!*


## Defining & running experiments

Experiments in stimsrv are implemented in JavaScript. A single ***experiment specification*** file defines both the user-facing side of the experiment (which runs in a *client*, usually a web browser) as well as the flow of the experiment (which is coordinated by the stimsrv *server*, which potentially controls and coordinates multiple clients). Stimsrv experiments can encompass multiple computers and laptops, mobile devices, uncommon devices such a e-book readers, and even printed media, all controlled from a single experiment specification.

To use stimsrv, install [Node.js](https://nodejs.org/) and run the following command in your project directory:

```
npm install stimsrv
```

(The *[stimsrv experiment template](https://github.com/floledermann/stimsrv-experiment-template)* provides scripts for Windows to perform such tasks without using the command line.)

A minimal experiment specification file looks like this:

```javascript
// Load the "pause" task
const pause = require("stimsrv/task/pause");

// Export the experiment definition
module.exports = {
  
  name: "Minimal experiment example",
    
  tasks: [
  
    pause({
      message: "Hello from stimsrv",
      store: true  // by default, the pause task is not stored - store it so that we have some data
    })
    
  ]
}
```

After saving the file (e.g. as `experiment-simple.js`), you can run this experiment from your project directory with:

```
npx stimsrv --open experiment-simple.js
```

(Replace `experiment-simple.js` with the actual name of your experiment file.)

This will start the stimsrv server and open a browser window, showing the experiment start page. (Omit `--open` if you only want to start the server and want to open the browser window(s) manually. The server will show the URL to connect to in its output.)

After choosing one of the two available *roles* in the web browser (which are provided by default and [can be changed](#device-configuration--roles)), the experiment will display the message "Hello from stimsrv" and a "Continue" button (the default for the pause task). When the button is clicked, the experiment ends, the results are stored in the `data` folder inside your project directory, and the experiment is run again immediately (again, all of this is the default behaviour which can be changed if desired).

A more complex experiment that actually delivers useful data could look like this:

```javascript
// load the tasks and controllers used in the experiment
const pause = require("stimsrv/task/pause");
const sloan = require("stimsrv/task/sloan");
const staircase = require("stimsrv/controller/staircase");

module.exports = {
  
  name: "A small experiment to test visual acuity using Sloan letters",
    
  tasks: [
  
    pause({
      message: "Press 'Continue' when you are ready to start the experiment"
    }),
    
    // Task that shows Sloan letters and offers buttons for response
    sloan({
      backgroundIntensity: 1,      // white background
      foregroundIntensity: 0,      // black foreground
      size:                        // size will be changed using the staircase method with 5 reversals
        staircase({
          startValue: "5mm",
          stepSize: 1.2,
          stepType: "multiply",
          minReversals: 5
      }),
      // add the resulting logMAR score to the context
      nextContext: trials => ({logMAR: sloan.logMAR(trials)})
    }),
    
    pause({
      message: context => "Your visual acuity was determined at logMAR " + context.logMAR + "."
    }),
    
  ]
}
```

*(A variant of this experiment can be found in the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples#examples-in-this-repository))*

## Experiment results

By default, results data is written to the `data` subdirectory relative to the experiment specification, as a JSON file, after each run of the experiment. The results file contains information for each trial of each task of the experiment, plus additional information such as timestamps, errors and warnings that may have occured during the experiment run.

For the example above, a results file could look like this:

```javascript
// Example experiment results file "data/user_001.json" (some information omitted)
{
  "description": "Experiments results data for participant #1 -- generated by stimsrv v0.0.1",
  "experimentName": "A small experiment to test visual acuity",
// ...
  "warnings": [
    {
      "message": "No value for pixeldensity provided, using default of 96.",
      "timeOffset": 5883
    },
    {
      "message": "logMAR: Stimulus size is specified in mm but viewing distance is not specified - \
       use angular units (arcmin, arcsec) to specifiy stimulus size or specify viewing distance for \
       logMAR calculation.",
      "timeOffset": 20363
    }
  ],
  "results": [
    {
      "name": "sloan",
      "description": "Sloan letters visual acuity test",  
// ...
      "trials": [
        {
          "trialTimeOffset": 1,
          "condition": {
            "letter": "V",
            "size": "5mm"
          },
          "response": {
            "letter": "V"
          }
        },
        {
          "trialTimeOffset": 2087,
          "condition": {
            "letter": "R",
            "size": "4.166666666666667mm"
          },
          "response": {
            "letter": "R"
          }
        },
        
// ... rest of the results data
```

What springs to mind are two warnings at the beginning of the file. These warnings indicate that the experiment hasn't been sufficiently specified to accurately establish the visual acuity of the participant! To make the experiment results valid, additional information about the devices in the experiment (such as their pixel density and viewing distance) has to be added to the experiment specification. This is covered in the next section.

## Device configuration & roles

The *devices* in your experiment each participate in a specific *role*, which determines the arrangement of interfaces provided for stimulus display and user response/interaction. In your experiment configuration, **`devices`** are defined as an Array of plain JS objects, each with a mandatory **`id`** entry, and optionally a human-readable **`name`** and (hardware) properties of the device.

```JS
// *devices* entry of your experiment
devices: [
  { 
    id: "supervisor_tablet",
    name: "Tablet of experimenter",
    resolution: "1920x1080",
    pixeldensity: 150
  },
  {
    id: "participant_phone",
    name: "Phone for participant",
    resolution: "1080x1920",
    pixeldensity: 441
  }
],
```

Devices need to be assigned to one or more roles to participate in the experiment. In your experiment configuration, **`roles`** are defined as plain JS objects, with a mandatory **`role`** entry specifying the role id, the **`devices`** for which this role is available, and the **`interfaces`** that are enabled for this role. For each task in the experiment, the list of interfaces available for the device's role is matched with the interfaces defined by the task, and the matching interfaces are rendered on the device. Each interface will usually be represented by a `<section>` element in the client's HTML output – therefore, multiple interfaces can be shown simultaneously if the role requires it.

```JS
// *roles* entry of your experiment
roles: [
  {
    role: "participant",
    devices: ["participant_phone"],
    interfaces: ["display", "response"]
  },
  { 
    role: "supervisor",
    devices: ["supervisor_tablet"],
    interfaces: ["monitor", "control"]
  }
],
```

A few standardized names for interfaces are established by convention – `"display"` for the participant's display, `"response"` for the response input, `"monitor"` for monitoring the experment (by the supervisor), `"control"` for the supervisor's controls. But these names are only conventions and can be changed according to the requirements of your particular experiment.

When starting an experiment, stimsrv outputs the available device IDs to the console, together with information on how to connect to the stimsrv server.

![stimsrv console output](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-console-output.png)

Upon entering the specified URL in your web browser (or, when using the `--open` option, the web browser will be launched automatically), you are shown a form in which you can enter the client ID, and get to select the roles available for the selected client.

![stimsrv console output](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-experiment-start.png)

Chose a role and click on "Start" to join the experiment with that browser and the selected role.

### Support for old & simple web browsers

By default, stimsrv relies on clients having an up-to-date web browser for full interactivity and accurate rendering. However, devices with older or simple web browsers (like older smartphones or e-book readers) can be used for stimulus display by rendering on the server and delivering the graphics to the client as an image.

See [stimsrv-client-puppeteer](https://github.com/floledermann/stimsrv-client-puppeteer) for more details on how to enable and configure server-side rendering.

### Modifying the frontend with CSS

The HTML structure established by stimsrv is quite simple. Inside the `body`, a `section` with `id=interface-<interfaceName>` is created for each UI component of the current task which is available for the given role. Within those `sections`, each UI component may create the required HTML.

Furthermore, a few classes are set on the `body` to indicate the state of the frontend: `is-device-<deviceId>`, `has-role-<roleName>`, `has-ui-<uiName>` and `current-task-<taskName>` are set according to the current device, role, UIs and tasks. These can be used in CSS selectors for fine-grained and context-dependent customization of the user interface.

This is the HTML structure typically generated by stimsrv (some meta tags etc. omitted):

```html
<html>
  <head>
  <link rel="stylesheet" href="/static/stimsrv.css">
  <style>
    <!-- styles added by experiment, device or role CSS specifications. -->
  </style>
  </head>
  <body class="is-device-device1 has-role-main has-ui-display has-ui-response current-task-task1">
    <section class="interface" id="interface-display">
      <!-- HTML generated by the "display" ui -->
    </section>
    <section class="interface" id="interface-response" style="">
      <!-- HTML generated by the "response" ui -->
    </section>
  </body>
</html>
```

To modify the appearance and layout of the stimsrv frontend, you can add a `css` property to the experiment, roles and devices and to most tasks. These styles will be applied in the frontend accordingly (e.g. styles specified for a particular device will only be added on that device).

By default, stimsrv uses the flexbox layout for laying out the UI elements, stacked horizontally. By overriding the appropriate CSS properties (potentially only for some roles or devices, or only for some tasks), the layout can be adjusted and even the order of items can be changed using the CSS `order` property. If needed, the layout mechanism can also be changed to grid or any other CSS layout mechanism by overriding the approprate CSS properties. You can inspect the file [`static/stimsrv.css`](https://github.com/floledermann/stimsrv/blob/main/static/stimsrv.css) or use your browsers developer tools to see which CSS properties are set by stimsrv and potentially need to be overridden.

Here is an example experiment configuration that adjusts the font size a particular device and changes the order of UI components for the first task:

```js
module.exports = {
  
  name: "CSS Override Example",
  
  // css property at the experiment level - applied on all frontends
  css: `
    /* CSS applied to the overall experiment. */
    body {
      font-size: 12px;
    }
  `,

  devices: [
    {
      id: "mobile",
      // CSS to use for this device
      css: `
        #interface-response {
          font-size: 2em;  /* double font size for "response" UI */
        }
      `
    }
  ],
  
  tasks: [
  
    pause({
      name: "task1",
      message: "This is task 1.",
      // css property of task - is only present as long as the task is active
      css: `
        /* The oder property can be used to reorder UI elements in the flexbox layout. */
        #interface-display {
          order: 2;
        }
        #interface-response {
          order: 1;
        }
      `,
    })
  ]
}
  
See the [CSS override example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/custom-css) for the full code and more possibilities for customizing an experiment's CSS.
```

## Implementing tasks

A stimsrv task is composed of two parts: the ***controller***, which usually runs on the server and controls the sequence of *conditions* to be processed, and the ***frontend***, which usually runs on the client(s) and is responsible for rendering the condition in one or more *user interfaces* and sending *responses* back to the server. (See [below](#terminology) for the terminology used in stimsrv.)

Generally, most concepts in stimsrv are represented either by *plain JS objects* (for data and objects) or by *functions* (for dynamic behaviour).

### Implementing tasks from scratch

A stimsrv task is simply a plain JS object with entries for `frontend`, and (optionally) the `controller` and other properties. Both `frontend`, and `controller` are functions which recieve a context object and return a plain JS object specifying the behaviour. So the basic structure of a task looks like this:

```JS
// Basic structure of a custom task
{
  // Name of the task
  name: "task1",
  // Task frontend - this will be run on the client(s)
  frontend: context => {
    return {
      interfaces: {
        // ...
        // information about the user interfaces to show for the task
        // ...
      }
    }
  },
  // Task controller - this will be run on the server
  controller: context => {
    return {
      nextCondition: (lastCondition, lastResponse, conditions, responses) => {
        // ...
        // progression from one condition to the next for the task
        // ...
      }
    }
  }
}
```

The **`name`** entry of the task is a String with the task's name, which will be used to identify the task in the stored result data.

#### Task *frontend* options

The **`frontend`** entry of the task definition is a function that recieves a context object (see below, you can ignore this for simple tasks) and returns a plain JS object defining the task's user interfaces. The returned object needs to have an entry **`interfaces`**, which is another plain JS object containing an entry for each of the interfaces the task needs to show These entries are matched with the `interfaces` of each client's role to determine which user interfaces should be shown on each client. For each interface entry, you can either use ready made components such as `canvasRenderer()` or `htmlButtons()`, or provide your own implementation. For custom interfaces, two methods need to be provided: **`initialize()`** which is called once when the task activates (and gets passed the parent DOM object and a reference to the stimsrv client API), and **`render()`**, which is called once for each new condition the task receives (which is passed as its parameter).

Option |  | type | Description
-------|--|------|------------
**`interfaces`** | mandatory | Object | Plain JS object with an entry for each interface (e.g. `display`, `response` etc.).
`transformCondition` | optional | Function | Function `context => condition => condition`, returning an object with entries to extend / alter the condition on the client. The passed in `context` contains the device's and role's specific properties. The properties of the returned object will be added to the current condition object before passing it to each interface's `render()` function.

#### Task *controller* options

The **`controller`** entry of the task definition is a function that recieves a context object (see below, you can ignore this for simple tasks) and returns a plain JS object with entries for `nextCondition()` and (optionally) `nextContext()`. `nextCondition()` returns the next condition to render on the client(s), or `null` if the task should end and the experiment should continue with the next task.

Option |  | type | Description
-------|--|------|------------
**`nextCondition`** | mandatory | Function | Function `(lastCondition, lastResponse, trials) => condition` generating a new condition object from previous results. `trials` is an Array of task results, each containing a `condition` and `response` entry.
`nextContext` | optional | Function | Function `(context, trials) => context`, returning an object with entries to add / alter the context passed to the next task. `trials` is an Array of task results, each containing a `condition` and `response` entry. The properties of the returned object will be applied to the current context object before initializing the next task.

Full example code for a custom task implementation (taken from the [custom task example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/custom-task)):

```JS
// *tasks* entry of your experiment
tasks: [
  // Let's make a custom task from scratch, without any help from library functions!
  // A stimsrv task is simply a plain JS object adhering to a simple structure.
  // On the top level, there are 3 entries: name, frontend, controller
  {
    // *name* is simply the name/id of the task (will be used in saved data, for example)
    name: "task1",
    // *frontend* is a function that receives the task's context and 
    // returns information on the task's frontend components.
    // The task's frontend will be rendered on each participating client.
    frontend: context => {
      let textEl = null;
      let buttonEl = null;
      // The object returned by task.frontend() has to have an "interfaces" entry
      return {
        interfaces: {
          // The entries in the interfaces object are matched up with the interfaces 
          // defined by the client role (defined above at the experiment level).
          // By convention, the "display" interface is used for displaying the stimulus:
          display: {
            // Each inerfaces entry contains two functions: initialize() and render().
            // initialize() gets passed the parent element and the stimsrv client API,
            // and sets up ui elements and interaction.
            initialize: (parent, stimsrv) => {
              // Add a simple text element to the parent
              textEl = parent.ownerDocument.createElement("p");
              textEl.innerHTML = "Hello, stimsrv!";
              parent.appendChild(textEl);
            },
            // render() adapts the ui to the current condition (as received from the server)
            render: condition => {
              textEl.innerHTML += "<br>" + condition.text;
            }
          },
          // Second user interface component.
          // By convention, the "response" interface is used for entering user responses:
          response: {
            initialize: (parent, stimsrv) => {
              // Add a button
              buttonEl = parent.ownerDocument.createElement("button");
              buttonEl.textContent = "Next";
              parent.appendChild(buttonEl);
              // Set up the button so clicking it sends a response to the server
              buttonEl.addEventListener("click", () => {
                stimsrv.response({
                  // Response data - can be anything you want to send to the controller
                });
              });
            },
            render: condition => {
              // The response ui can also adapt dynamically to the condition
              if (condition.count == 3) {
                buttonEl.textContent = "Finish";
              }
            }
          }
        }
      }
    },
    // The "controller" part is run on the server and coordinates the flow of the experiment.
    // *controller* is also a function that receives the current context and returns an object.
    controller: context => ({
      // nextCondition() is the only mandatory entry in the controller object.
      // It receives data from the previous conditions and responses,
      // and returns the next condition, or null if the task has finished.
      nextCondition: (lastCondition, lastResponse, conditions, responses) => {
        if (conditions.length < 3) {
          return {
            // Condition data - can be anything you want to send to the client(s)
            text: "Condition " + (conditions.length + 1),
            count: conditions.length + 1
          };
        }
        // Return null when end of task has been reached
        return null;
      }
    })
  }
],
```

By stimsrv requiring tasks to only adhere to this simple interface, this opens up the possibility to implement your tasks using whichever programming paradigm you prefer - using plain JS objects, classes or functional-compositional approaches. 

### Implementing tasks using the provided utility functions

*(... coming soon ...)*


## Context & controllers

*(... coming soon ...)*

## Experiment settings & data storage

*(... coming soon ...)*

## Events

*(... coming soon ...)*

The [n-sided Pong example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/pong) shows realtime event synchronization between clients in action.

[![3-sided Pong on stimsrv](https://img.youtube.com/vi/oe6Ff-pTMS4/0.jpg)](https://www.youtube.com/watch?v=oe6Ff-pTMS4)

## Design Philosophy & Terminology

Stimsrv follows a [function-based](https://en.wikipedia.org/wiki/Functional_programming), [composition-over-inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) programming style. This means that the dynamic behaviour of an experiment can be expressed concisely with [plain javascript objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#using_object_initializers) (for configuration) and [functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) (for dynamic behaviour), without having to deal with complex APIs or class hierarchies. Even complex, distributed experiments can usually be implemented by creating a single experiment definition file, plus one file for each task that you need to implement for your experiment. Because experiment definitions are JavaScript files, all features of the language (such as inline functions or iterators) can be used to configure an experiment. The stimsrv server takes care of packaging and delivering the experiment code for web browsers and coordinating multiple clients, among other things.

The hope is that by defining experiments in a concise yet comprehensive format, the details of an experiment will be less opaque and better reproducible, aiding the ideal of open and reproducible science.

### Terminology

- ***Experiment***: All aspects contributing to an experiment, including client devices, data storage and the definition of tasks that should be run.
- ***Task***: Part of an experiment, usually presenting some stimulus to the participant and expecting some kind of response from them. (Example: A Task may show letters of the alphabet to the participant and let the participant respond with corresponding on-screen buttons). A sequence of tasks is run during an experiment.
- ***Configuration***: The structure and settings for all parts of the experiment and its tasks, defined in advance. The configuration does not change during an experiment run.
- ***Context***: The current circumstances under which a task is run. The context may change between one task and the next, but not during a single task.
- ***Trial***: A single run of a task. Usually, the participant is presented with a specific stimulus, and reacts with a specific response. (Example: in a single trial, above task may display the letter "B" to the participant, and wait for their response. For the next trial, another letter may be displayed.) A single task may run multiple trials, until a condition for going to the next task is met.
- ***Condition***: A set of properties that define the stimulus for a trial. In the example above, the condition specifies the specific letter to be shown, plus other aspects of the presentation (e.g. the font size to use, the contrast ratio etc.).
- ***Response***: A set of properties that define the response of the participant. In the example above, the response will contain information on which button was pressed. Responses can be classified with respect to the condition (i.e. whether the correct button corresponding to the letter shown has been pressed).
- ***Result***: The result of a trial. Contains information about the condition, the response, the context plus additional information, such as timing information.

### System overview

This graphics shows an overview of the flow of information in stimsrv.

![stimsrv overview](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-diagram-small.png)

<!--
## Available tasks

### Tasks provided as part of stimsrv

### Official extension tasks

### Tasks developed by 3rd parties
-->
<!--
## Experiments examples
-->

## License, Credits & Acknowledgements

<img align="right" src="http://www.gnu.org/graphics/agplv3-with-text-100x42.png">

stimsrv is licensed under the [GNU Affero General Public License, Version 3](https://www.gnu.org/licenses/agpl-3.0.en.html). Roughly speaking, this license allows you to use and modify stimsrv free of charge, provided that you publish the modified or extended code under the same license.

(This isn't legal advice, please consider consulting a lawyer and see the [full license](https://www.gnu.org/licenses/agpl-3.0.en.html) for all details.)

If you need a different license for your purposes, contact the author of stimsrv (see below for contact information). Individual licenses and support may be available upon request.

If you use stimsrv in your research, please cite the following publication:

----

**Ledermann, F. and Gartner, G.: *Towards Conducting Reproducible Distributed Experiments in the Geosciences*. Proceedings of the 24th AGILE Conference on Geographic Information Science, AGILE GIScience Series, 2, 33, https://doi.org/10.5194/agile-giss-2-33-2021, 2021.**

----

stimsrv is created by [Florian Ledermann](https://twitter.com/floledermann) at [TU Wien, Research Unit Cartography](https://cartography.tuwien.ac.at/).




