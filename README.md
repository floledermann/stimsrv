# stimsrv — Browser-based Psychological Experiments and User Studies

! | This is alpha version software – everything may still change without prior notice | !
--|-----------------------------------------------------------------------------------|--

|&nbsp;—&nbsp;[**Running&nbsp;Experiments**](#defining--running-experiments)&nbsp;— |&nbsp;—&nbsp;[**Experiment&nbsp;results**](#experiment-results)&nbsp;— |&nbsp;—&nbsp;[**Philosophy&nbsp;&amp;&nbsp;Terminology**](#design-philosophy--terminology)&nbsp;— |&nbsp;—&nbsp;[**License&nbsp;&amp;&nbsp;Credits**](#license-credits--acknowledgements)&nbsp;—&nbsp;|

stimsrv (***stim***ulus ***s***e***rv***er) is a system for running browser-based psychological experiments and user studies.

Main features:

- Implemented in JavaScript, leveraging a modern, function-based programming style and supporting seamless transition from server to client code.
- Run distributed experiments with multiple devices fulfilling different roles. For example, stimulus presentation can be performed by a desktop computer and participant feedback can be entered on a tablet connected by WiFi.
- Central control of experiment state and unidirectional data flow ensure deterministic experiment behaviour even in complex, distributed settings.
- Provides utilities that help to develop new experiment tasks with very little code, allowing researchers to focus on the core functionality (e.g. rendering the stimulus).
- Timestamp synchronization between multiple clients accomplishes temporal precision of a few milliseconds in local WiFi networks.
- Adaption of experiments to the device context, e.g. converting real-world measurements (millimeters, angular arcs) into appropriate pixel values depending on display resolution and viewing distance.
- Follows the design principle of “Simple things should be simple, complex things should be possible.” (Alan Kay)

To try out stimsrv, check out the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples). To implement your own experiment, you can start with the [stimsrv experiment template](https://github.com/floledermann/stimsrv-experiment-template).

*Important Note: While stimsrv experiments run in a web browser, currently its code is not audited for hosting publicly accessible online experiments. Stimsrv is currently intended for local use in private (lab) networks only!*


## Defining & running experiments

Experiments in stimsrv are implemented in JavaScript. A single ***experiment specification*** defines both the user-facing side of the experiment (which runs in a *client*, usually a web browser) and the flow of the experiment (which is coordinated by the stimsrv *server*, which potentially controls and coordinates multiple clients). Stimsrv experiments can encompass multiple computers and laptops, mobile devices, uncommon devices such a e-book readers, and even printed media, all controlled from a single experiment specification.

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

The devices in your experiment each participate in a specific *role*, which determines the arrangement of interfaces provided for stimulus display and user response/interaction. In your experiment configuration, **`devices`** are defined as an Array of plain JS objects, each with a mandatory **`id`** entry, and optionally a human-readable **`name`** and (hardware) properties of the device.

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

Devices need to be assigned to one or more roles to participate in the experiment. In your experiment configuration, **`roles`** are defined as plain JS objects, with a mandatory **`role`** entry specifying the role id, the **`devices`** for which this role is available, and the **`interfaces`** that are enabled for this role. For each task in the experiment, the list of interfaces available for the device's role is matched with the interfaces defined by the task, and the matching interfaces are rendered on the device. Each interface will be represented by a `<section>` element in the client's HTML output – therefore, multiple interfaces can be shown simultaneously if the role requires it.

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

A few standardized names for interfaces are established by convention – `"display"` for the participant's display, `"response"` for the response input, `"monitor"` for monitoring the experment (by the supervisor), `"control"` for the supervisor's controls. But these can be changed and additional interface names can be added, according to the requirements of your experiment.

When starting an experiment, stimsrv outputs the available device IDs to the console, together with information on how to connect to the stimsrv server.

![stimsrv console output](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-console-output.png)

Upon entering the specified URL in your web browser (or, when using the `--open` option, the web browser will launch automatically), you are shown a form in which you can enter the client ID, and get to select the roles available for the selected client.

![stimsrv console output](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-experiment-start.png)

Chose a role and click on "Start" to join the experiment with that browser and the selected role.

### Support for old & simple web browsers

By default, stimsrv relies on clients having an up-to-date web browser for full interactivity and accurate rendering. However, devices with older or simple web browsers (like older smartphones or e-book readers) can be used for stimulus display in experiments by rendering on the server and delivering the graphics to the client as an image.

See [stimsrv-client-puppeteer](https://github.com/floledermann/stimsrv-client-puppeteer) for more details on how to enable and configure server-side rendering.

### Modifying the frontend CSS

*(... coming soon ...)*

## Implementing tasks

A stimsrv task is composed of two parts: the ***controller***, which usually runs on the server and controls the sequence of *conditions* to be processed, and a ***ui***, which usually runs on the client(s) and is responsible for rendering the condition to the user and sending *responses* back to the server. (See [below](#terminology) for the terminology used in stimsrv.) A task is simply a plain JS object with entries for `ui`, and optionally the `controller` and other properties.

The **`ui`** entry of a task is a function that recieves a context object (see below) and returns a plain JS object with an entry **`interfaces`**, which is another plain JS object containing an entry for each of the interfaces the task wants to show (these are matched with the `interfaces` of each client's role to determine which interface should be shown on which client). Each of these entries contains two methods: **`initialize()`** which is called once when the task activates (and gets passed the parent DOM object and a reference to the stimsrv client API), and **`render()`**, which is called once for each new condition the task receives (which is passed as its parameter).

The **`controller`** entry of a task is a function that recieves a context object (see below) and returns a plain JS object with entries for `nextCondition()` and (optionally) `nextContext()`. `nextCondition()` returns the next condition to render on the client(s), or `null` if the task should end.

The **`name`** entry of the task is a String with the task's name, which will be used to store result data.

Example code for a custom task implementation (taken from the [custom task example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/custom-task)):

```JS
// *tasks* entry of your experiment
tasks: [
  // Let's make a custom task from scratch, without any help from library functions!
  // A stimsrv task is simply a plain JS object adhering to a simple structure.
  // On the top level, there are 3 entries: name, ui, controller
  {
    // *name* is simply the name/id of the task (will be used in saved data, for example)
    name: "task1",
    // *ui* is a function that receives the task's context and 
    // returns information on the task's ui components.
    // The task's ui will be rendered on each participating client.
    ui: context => {
      let textEl = null;
      let buttonEl = null;
      // The object returned by task.ui() has to have an "interfaces" entry
      return {
        interfaces: {
          // The entries in the interfaces object are matched up with the interfaces 
          // defined by the client role (defined above at the experiment level).
          // By convention, the "display" interface is used for displaying the stimulus:
          "display": {
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
          "response": {
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

By stimsrv only requiring this simple contract/interface from a task, this opens up the possibility to implement your tasks using whichever programming paradigm you prefer. Provided that the simple required pattern shown above is adhered to, tasks can be implemented using plain JS objects, classes or functional-compositional approaches. 

### Reusable components for task composition

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

If you need a different license for your purposes, contact the author of stimsrv. Individual licenses and support may be available upon request.

If you use stimsrv in your research, please cite the following publication:

----

**Ledermann, F. and Gartner, G.: *Towards Conducting Reproducible Distributed Experiments in the Geosciences*. Proceedings of the 24th AGILE Conference on Geographic Information Science, AGILE GIScience Series, 2, 33, https://doi.org/10.5194/agile-giss-2-33-2021, 2021.**

----

stimsrv is created by [Florian Ledermann](https://twitter.com/floledermann) at [TU Wien, Research Unit Cartography](https://cartography.tuwien.ac.at/).




