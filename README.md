<div align="center">

<h1>🧪🔬📲 stimsrv 🔎🗺📈<br>
<br>
A System for Distributed User Studies and Behavioural Experiments</h1>


<!--<a href="#design-philosophy--terminology">Philosophy&nbsp;&amp;&nbsp;Terminology</a> ·-->
<a href="#defining--running-experiments">Running&nbsp;Experiments</a> ·
<a href="#experiment-results">Experiment&nbsp;results</a> ·
<a href="#device-configuration--roles">Device&nbsp;configuration&nbsp;&amp;&nbsp;roles</a> ·
<a href="#configuring-tasks">Configuring&nbsp;tasks</a> ·
<a href="#modifying-the-frontend-with-css">Modifying&nbsp;the&nbsp;frontend with&nbsp;CSS</a> ·
<a href="#implementing-tasks">Implementing&nbsp;new&nbsp;tasks</a> ·
<a href="#terminology--system-overview">Terminology&nbsp;&amp;&nbsp;System&nbsp;overview</a> ·
<a href="#license-credits--acknowledgements">License&nbsp;&amp;&nbsp;Credits</a>
</div>

----

stimsrv (***stim***ulus ***s***e***rv***er) is a system for running user studies and psychological experiments, potentially across multiple devices.

| ⚠️ This is alpha version software – everything may still change without prior notice ⚠️ |
|----------------------------------------------------------------------------------------|

### Main features

- Run ***distributed experiments*** with multiple devices fulfilling different roles. For example, stimulus presentation can be performed by a desktop computer and participant feedback can be entered on a tablet connected by WiFi.
- ***Central control*** of experiment state and unidirectional data flow ensure deterministic experiment behaviour even in complex, distributed settings.
- Utilities that help to develop new experiment components with ***little boilerplate code***, allowing researchers to focus on the core functionality of their experiments.
- Adaption of the components of an experiment to ***device contexts***, e.g. device-specific configuration of display resolution and viewing distance.
- ***Timestamp synchronization*** between multiple clients for temporal precision down to a few milliseconds in local WiFi networks.
- Storing ***experiment results*** including conditions, responses, timing information and warnings about potential problems as a JSON file for further processing. 
- Implemented in ***JavaScript***, leveraging a modern, function-based programming style, supporting seamless transitions of code from server to client and making use of the web browser as a modern and versatile runtime environment.
- Automatic ***packaging and distribution*** of the code of an experiment to participating clients, so you don't have to mess with JavaScript build systems.
- Follows the design principle of ***“Simple things should be simple, complex things should be possible.”*** (Alan Kay)

### Try it out

To try out stimsrv, check out the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples). To start with implementing your own experiment, you can use the [stimsrv experiment template](https://github.com/floledermann/stimsrv-experiment-template).

⚠️ *Important Note: While stimsrv experiments run in a web browser, currently its code is not audited for hosting publicly accessible online experiments. Stimsrv is currently intended for local use in private (lab) networks only!*


### Design Philosophy & Terminology

Stimsrv follows a [function-based](https://en.wikipedia.org/wiki/Functional_programming), [composition-over-inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) programming style. This means that the dynamic behaviour of an experiment can be expressed concisely with *plain javascript objects* (for configuration) and *functions* (for dynamic behaviour). Even complex, distributed experiments can usually be implemented by creating a single concise experiment definition file. The stimsrv server takes care of packaging and delivering the experiment code and coordinating the experiment state across multiple clients, among other things.

See <a href="#terminology--system-overview">below</a> for <a href="#terminology--system-overview">key terminology and a system overview</a>.



<!--
Why higher-order functions:

- Modular components which are simply functions (e.g. reusable generators)
- Room to add a closure for state, e.g. context => { let count = 0; return condition => ({ text: count++ }); }
- Functional programming style, needs only a subset of JS to be taught to non-experts.
-->


## Defining & running experiments

Experiments in stimsrv are implemented in JavaScript. A single ***experiment specification*** file defines both the user-facing side of the experiment (which runs in a *client*, usually a web browser) as well as the flow of the experiment (which is coordinated by the stimsrv *server*, which potentially controls and coordinates multiple clients). Stimsrv experiments can encompass multiple computers and laptops, mobile devices, uncommon devices such a e-book readers, and even printed media, all controlled from a single experiment specification.

To use stimsrv, install [Node.js](https://nodejs.org/) and run the following command in your project directory:

```
npm install stimsrv
```

(The *[stimsrv experiment template](https://github.com/floledermann/stimsrv-experiment-template)* provides scripts for Windows to perform such tasks without using the command line.)

A minimal experiment specification file could look like this:

```javascript
// Load the "pause" task
const pause = require("stimsrv/task/pause");

// Export the experiment definition
module.exports = {
  
  name: "Minimal experiment example",
    
  tasks: [
  
    pause({
      message: "Hello from stimsrv",
      store: true  // by default, response data for the pause task is not stored
                   // enable storage so that we have some data
    })
    
  ]
}
```

After saving the file (e.g. as `experiment.js`), you can run this experiment from your project directory with:

```
npx stimsrv --open experiment.js
```

(The *[stimsrv experiment template](https://github.com/floledermann/stimsrv-experiment-template)* provides the run.bat script which you can double-click to run the experiment defined in `experiment.js`.)

This will start the stimsrv server and open a browser window, showing the experiment start page. (Omit `--open` if you only want to start the server and want to open the browser window(s) manually. The server will show the URL for the experiment in its output.)

After choosing one of the two available *roles* in the web browser (which are provided by default and [can be changed](#device-configuration--roles)), the experiment will display the message "Hello from stimsrv" and a "Continue" button. When the button is clicked, the experiment ends, the results are stored in the `data` folder inside your project directory, and the experiment is run again immediately for the next participant. (Note that all of this is the default behaviour which can be changed if desired.)

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
    
    // task that shows Sloan letters and offers corresponding buttons for response
    sloan({
      backgroundIntensity: 1,      // white background
      foregroundIntensity: 0,      // black foreground
      size:                        // size will be changed using a staircase method
        staircase({
          startValue: "5mm",       // dimension specified in real-world units!
          stepSize: 1.2,
          stepType: "multiply",
          minReversals: 5
      }),
      // at the end of the task, add the resulting logMAR score to the context
      nextContext: taskResults => ({logMAR: sloan.logMAR(taskResults)})
    }),
    
    pause({
      message: context => "Your visual acuity was determined at logMAR " + context.logMAR + "."
    }),
    
  ]
}
```

*(A variant of this experiment can be found in the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples#examples-in-this-repository))*



## Experiment results

By default, results data is written to the `data` subdirectory relative to the experiment specification, with a separate file for each participant. Data is stored as a JSON file which contains detailed information for each trial of each task of the experiment - conditions, reponses, timestamps etc., but also errors and warnings that may have occured during the experiment run.

For the example above, a results file could look like this:

```javascript
// Example experiment results file "data/user_001.json" (some information omitted)
{
  "description": "Experiments results data for participant #1 -- generated by stimsrv v0.0.1",
  "experimentName": "A small experiment to test visual acuity",
// ...
  "warnings": [
    {
      "message": "No value for pixelDensity provided, using default of 96.",
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

The *devices* in an experiment each participate in a specific *role*, which specifies the arrangement of *interfaces* for stimulus display and user interaction. In the experiment configuration, **`devices`** are defined as an Array of plain JS objects, each with a mandatory **`id`** entry, and optionally a human-readable **`name`** followed by properties of the device.

For example, to accurately convert from millimeters to pixels for our visual acuity experiment, information on display device's pixel density needs to be provided. Furthermore, in order to calculate the participant's logMAR score, information about the viewing distance (the distance from the participants eyes to the display) needs to be provided.

```JS
// *devices* entry of your experiment
devices: [
  { 
    id: "supervisor_tablet",
    name: "Tablet of experimenter",
    resolution: "1920x1080",
    pixelDensity: 150
  },
  {
    id: "participant_phone",
    name: "Phone for participant",
    resolution: "1080x1920",
    pixelDensity: 441,
    viewingDistance: 500  // viewing distance in mm
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

A few standardized names for interfaces are established by convention – `"display"` for the participant's display, `"response"` for the response input, `"monitor"` for monitoring of the experment (by the supervisor), `"control"` for the supervisor's controls. But these names are only conventions and can be changed according to the requirements of your particular experiment.

When starting an experiment, stimsrv outputs the available device IDs to the console, together with information on how to connect to the stimsrv server.

![stimsrv console output](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-console-output.png)

Opening the specified URL in a web browser (or, when using the `--open` option, the web browser will be launched automatically) shows the experiment start page, on which the client ID can be entered and a role can be selected from the list of roles available for the client.

![stimsrv console output](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-experiment-start.png)

Chose a role and click on "Start" to join the experiment with that browser and the selected role.

### Support for old & simple web browsers

By default, stimsrv relies on clients having an up-to-date web browser for full interactivity and accurate rendering. However, devices with older or simple web browsers (like e-book readers or older smartphones) can be used for stimulus display by rendering on the server and delivering the graphics to the client as an image.

See [stimsrv-client-puppeteer](https://github.com/floledermann/stimsrv-client-puppeteer) for more details on how to enable and configure server-side rendering.



## Configuring tasks

stimsrv comes with a library of reusable basic tasks that can be adapted to the needs of an experiment. See the [task directory](https://github.com/floledermann/stimsrv/tree/main/src/task) for the built-in tasks. See section ["Implementing tasks"](#implementing-tasks) for how to implement your own tasks.

To create a task, simply call its creation function, specifying the task's configurable properties in an object.

```JS
// Create the "text" task
text({
  name: "task1",                // Name of the task (will be used in results data) 
  text: "Can you read this?",   // Text to display
  fontSize: "4mm",              // Font size. Dimensions will be converted to pixels internally
  rotate: 10,                   // Rotate by 10 degrees
  choices: ["Yes","No"]         // The response choices, displayed as buttons in the response interface
})
```

Most configuration properties are used to specify the condition(s) for the task. Such condition parameters can be constant (numbers, strings, arrays or objects) or they can be generated dynamically. Some tasks may allow dimensions to be specified as a string, containing the numeric value and a unit (e.g. the `fontSize` parameter in the example above).

Specifying only constant condition parameters would cause the same condition for the task to repeat indefinitely, which is rarely what you want in an experiment. Therefore, at least one property will need to be specified to produce a sequence of values in subsequent trials. A range of helper functions is available for specifying such sequences, including pre-defined sequences, randomized sequences, random values within a range, or dynamic parameters adapting to a participant's responses.

This example adjusts the font size according to a pre-defined sequence, and randomizes the rotation of the text for each trial.

```JS
const sequence = require("stimsrv/controller/sequence");
const random = require("stimsrv/controller/random");

// ...

// Configuring a dynamic "text" task
text({
  name: "task1",                
  text: "Can you read this?",
  // Font size will become increasingly smaller on each trial.
  // Once the sequence is exhausted, the experiment will proceed with the next task.
  fontSize: sequence(["4mm","3mm","2mm"]),  
  // Rotate by a random amount on each trial, rounded to full degrees
  rotate: random.range(-30,30, {round: 1}),
  choices: ["Yes","No"] 
})
```

### Generators for property values

The following helpers are provided for generating parameter sequences:

#### *sequence(items[, options])*

`const sequence = require("stimsrv/controller/sequence")`

Iterator, going through the specified items one by one. Stops the task by default once all items have been processed.

**items**: Array of values the sequence should iterate through. Any item that is a function will be called with the Task's `context` and replaced by its return value before the start of the sequence.

**options**: Object with entries for the following options:

 Option       | default   | Description
--------------|-----------|------------
**stepCount** | `1`       | Repeat each item stepCount times
**loop**      | `false`   | Loop after sequence is exhausted
**loopCount** | `Infinity`| Stop after loopCount loops

##### Example:

```JS
const sequence = require("stimsrv/controller/sequence");
const text = require("stimsrv/task/text");

// ...

// This will display conditions "Red","Green","Blue","Red","Green","Blue" 
// and then end the task
text({
  text: sequence(["Red","Green","Blue"], { loop: true, loopCount: 2 })
})
```

#### *sequence.loop(items[, options])*

Identical to `sequence` with `loop` option set to true.

#### *sequence.array(items)*

Iterator, creating a sequence of arrays from an array of iterators.

**items**: An Array containing iterators and values. For each iteration, each iterator will be queried for the next value and the result array will contain those values.

The iterator is exhausted when any iterator in the array becomes exhausted.

#### *random(items, options)*

`const random = require("stimsrv/controller/random")`

Picks a random item from the Array of items in each step (sampling with replacement).

**options**: Object with entries for the following options:

 Option       | default   | Description
--------------|-----------|------------
**itemCount** | `Infinity`| Stop after this number of items

#### *random.pick(items, options)*

Same as `random(items)`.

#### *random.shuffle(items, options)*

Shuffles the Array of items and returns items in random order (sampling without replacement).

**items**: Array of values the sequence should iterate through. Any item that is a function will be called with the Task's `context` and replaced by its return value before the start of the sequence.

**options**: Object with entries for the following options:

 Option                 | default | Description
------------------------|---------|------------
**multiple**            | `1`     | Duplicate items to create this number of copies of each item *before* shuffling
**loop**                | `false` | Re-shuffle and restart after sequence is exhausted
**preventContinuation** | `true`  | When looping, shuffle repeatedly until first item of next sequence is not equal to the last item of the previous sequence.

#### *random.sequence(items, options)*

Same as `random.shuffle`.

#### *random.loop(items, options)*

Same as `random.shuffle` with `loop` option set to true.

#### *random.range(from, to, options)*

Generate random numbers in the range from `from` (inclusive) to `to` (exclusive).

**options**: Object with entries for the following options:

 Option       | default | Description
--------------|---------|------------
**round**     | `false` | If a number, round to whole multiples of that number (e.g. 10, 2 (=round numbers), 1 (whole numbers), 0.1 etc.). If true, round to whole numbers.
**suffix**    | `null`  | A String to be appended to the resulting number.

### Dynamic parameter generators

In some cases, condition parameters should be determined based on the responses by the participant, for example to adapt the stimulus to successful or unsuccessfule responses.

Currently, only the staircase method is implemented.

#### *staircase(options)*

`const staircase = require("stimsrv/controller/staircase")`

Adjusts its value up/down depending on the correctness of the previous response(s), using a [staircase method](https://dictionary.apa.org/staircase-method).

For example, here is a text task that adjusts the font size in reaction to user feedback:

```JS
text({
  name: "task1",                
  text: "Can you read this?",
  choices: ["Yes","No"],
  fontSize: staircase({
    startValue: "4mm",
    numDown: 1,           // advance every step
    isResponseCorrect: context => (condition, response) => response.choice == "Yes"
  })
})
```

**options**: Object with entries for the following options:

 Option               | default    | Description
----------------------|------------|------------
**isResponseCorrect** | [`matchProperties`](https://github.com/floledermann/stimsrv/blob/main/src/util/matchProperties.js) | A function `context => (condition, response) => <Boolean>`, receiving the last condition and last response and returning a boolean whether the response is considered "correct". This determines the direction of the next staircase step.
**startValue**        | `1`        | The start value. Can be a string containing a unit (e.g. `"2mm"`), in which case the unit will be used for all output values.
**stepType**          | `"db"`     | The step type, one of "db" (step size specified in dB), "linear" (step size will be added/subtracted to the current value in each step), "log" (step size is specified in log10), "multiply" (current value will be multiplied/divided by step size in each step).
**stepSize**          | `2`        | The step size. Its interpretation depends on the `stepType` option.
**stepSizeFine**      | `1`        | The step size when in "fine" mode.
**minReversals**      | `3`        | The minimum number of reversals to perform. The task will end when both minReversals and minTrials are reached.
**minTrials**         | `0`        | The minimum number of trials to perform. The task will end when both minReversals and minTrials are reached.
**numUp**             | `1`        | Number of "incorrect" responses to cause the value to go up.
**numDown**           | `3`        | Number of "correct" response to cause the value to go down.
**numReversalsFine**  | `Infinity` | Switch to stepSizeFine after this many reversals.
**initialSingleReverse** | `true`  | Whether to advance at each step before the first reversal.
**minValue**          | `-Infinity`| The minimum value to emit.
**maxValue**          | `Infinity` | The maximum value to emit.


### Implementing custom parameter generators

Parameter generators are implemented as a function that gets passed the context and returns an object with a single method `next()`. This function gets called with the last condition, the last response and an array of data of all previous trials, and is expected to return an object containing an entry for `value` and `done` (following the [JavaScript iterator protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol)).

```JS
text({
  name: "task1",                
  text: context => {
    let count = 0;
    return {
      next: (lastCondition, lastResponse, trials) => {
        count++;
        if (lastResponse && lastResponse.choice == "No") return {done: true};
        return { value: "Trial " + count + ". Continue?" };
      }
    }
  },
  choices: ["Yes","No"]
})
```

### Functions for processing condititions

In addition to parameter generators, two functions can be specified in the task configuration that further affect the conditions of the task.

#### *generateCondition*

A function which is called after a new condition has been constructed (from constant parameters and parameter generators), before it is sent out to clients. The properties of the returned object will be merged with the condition.

The signature for generateCondition is `context => (currentCondition, lastCondition, lastResponse, trials) => Object`. The properties of the returned object will be added to the condition, overwriting any parameters defined in both. If the value of a parameter is `undefined`, it is removed from the condition.

This allows, among other things, for the definition of related condition parameters. It can be used with the provided generators, or by providing a custom function.

In the following examples, the text and font size are set to matching values. The first example uses a generator to populate multiple parameters in unison, the second implementation has a simple generator assign the font size and sets the matching text in generateCondition().

```JS
/*
Conditions will be either
{ angle: 15, text: "Large Text", fontSize: "10mm" }
or
{ angle: 15, text: "Small Text", fontSize: "3mm" }
*/

text({
  angle: 15,    // constant for all conditions
  generateCondition: random.shuffle([
    {
      text: "Large Text",
      fontSize: "10mm",
    },
    {
      text: "Small Text",
      fontSize: "3mm",
    }
  ])
})
```

```JS
/*
Identical behaviour as above, different implementation strategy.
*/

text({
  angle: 15,
  fontSize: random.shuffle(["10mm","5mm"]),
  generateCondition: context => condition => {
    // Parameter generators will have been run before generateCondition is called, 
    // so we can "react" on the chosen font size.
    return {
      text: parseFloat(condition.fontSize) > 7 ? "Large Text" : "Small Text"
     }
  }
})
```

#### *transformConditionOnClient*

transformConditionOnClient allows a further transformation of the condition parameters in the context of the client device. It gets passed the *client context* (the task context mixed with the properties of the client's [device specification](#device-configuration--roles)), containing information about the particular device (e.g. screen resolution etc.). It is therefore possible to adapt conditions to the particular circumstances of the device.

```JS
text({
  text: "Can you read this?",
  fontSize: "5mm",
  transformConditionOnClient: clientContext => condition => {
    // Enlarge font on clients with a large viewing distance
    if (clientContext.viewingDistance > 600) {
      return {
        fontSize: "10mm"
      }
    }
  }
})
```

#### *nextContext*

### Further task properties

#### interfaces

#### css

#### *resources*

### Task default settings



## Modifying the frontend with CSS

On each client, stimsrv establishes a simple HTML stucture containing a `section` with id `interface‑<interfaceName>` for each UI component available for the given role. Within those sections, each UI component of a task may create the required HTML content.

Furthermore, a few classes are set on the `body` to indicate the state of the frontend: `is‑device‑<deviceId>`, `has‑role‑<roleName>`, `has‑ui‑<uiName>` and `current‑task‑<taskName>` are set according to the current device, role, UIs and tasks. These can be used in CSS selectors for fine-grained and context-dependent customization of the user interface.

This is the HTML structure typically generated by stimsrv:

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

To modify the appearance and layout of the stimsrv frontend, you can add a `css` property to the experiment, roles and devices and to most tasks (depending on the task implementation). These styles will be applied in the frontend accordingly (e.g. styles specified for a particular device will only be added on that device).

By default, stimsrv uses the flexbox layout for laying out the UI elements, stacked horizontally. By overriding the appropriate CSS properties (potentially only for some roles or devices, or only for some tasks), the layout can be adjusted and even the order of items can be changed using the CSS `order` property. If needed, the layout mechanism can also be changed to CSS grid or any other CSS layout mechanism by setting the approprate properties. The file [`static/stimsrv.css`](https://github.com/floledermann/stimsrv/blob/main/static/stimsrv.css) contains the CSS rules applied by default. You can also use your browsers developer tools to see which CSS properties are set by stimsrv and potentially need to be overridden.

This is an example experiment configuration that adjusts the font size for a particular device and changes the order of UI components for the first task:

```js
module.exports = {
  
  name: "CSS Override Example",
  
  // CSS applied on all clients
  // (The classes set on the body can be used to apply styles only for specific roles, devices or tasks)
  css: `
    body {
      font-size: 12px;
    }    
    .has-ui-response button {
      font-size: 14px;
    }
  `,

  devices: [
    {
      id: "mobile",
      // CSS applied only on this device
      // (Double font size for "response" UI)
      css: `
        #interface-response {
          font-size: 2em;  
        }
      `
    }
  ],
  
  tasks: [
  
    pause({
      name: "task1",
      message: "This is task 1.",
      // CSS applied only as long as the task is active
      // (The order property can be used to reorder UI elements in the flexbox layout)
      css: `       
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
```

See the [CSS override example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/custom-css) for the full code and more possibilities for customizing an experiment's CSS.



## Implementing tasks

For most experiments it will be necessary to implement your own tasks. stimsrv provides a low-level API for tasks that puts very few constraints on how they are impelmented. For tasks which follow a more standardized model, a high-level helper function to create tasks is provided.

### Implementing tasks using the simpleTask helper

The simpleTask helper function can be used to implement tasks that follow the model of the built-in tasks described in section [configuring tasks](#configuring-tasks). Using the simpleTask function, your task will automatically benefit from several features which are provided by the utility:

- The conditions for your task can be specified using constant values, callback functions or iterators, as discussed above.
- Default settings for the task can be specified and changed globally using the `.defaults()` method.
- User interfaces can be remapped to named interface areas.
- Additional user interfaces can be added using the `interfaces` property.
- `resources` and `css` can be specified and will be processed.
- `generateCondition`, `transformConditionOnClient` and `nextContext` functions can be specified and will be processed.
- Condition parameters are split into static (constant during the run of a task) and dynamic (changing with every trial) parameters when results are saved.

#### *simpleTask(taskSpec)*

**taskSpec** is an object containing the specification for the task.

Option          | default         | Description
----------------|-----------------|------------
**name**        | `"Unnamed Task"`| The default name of the task (can be overridden by user configuration)
**description** | `""`            | The default description of the task (can be overridden by user configuration)
**defaults**    | `{}`            | The default settings for the task (mainly the default condition parameters)
**interfaces**  | `{}`            | The tasks user interfaces. An object with one entry for each interface, with the key specifying the default interface and the value being a function `config => context => UserInterface` to construct the interface (see below).
**nextContext** | `null`          | A function to modify the context at the end of the task. This will be applied in addition to any nextContext function defined for the task instance.

See the [simple task example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/custom-simple-task) for a demonstration how the simpleTask helper can be used to implement your own tasks.

*(... description coming soon ...)*

### Implementing tasks using the low-level API

Internally, a stimsrv task is composed of two parts: the ***controller***, which usually runs on the server and controls the sequence of *conditions* to be processed, and the ***frontend***, which usually runs on the client(s) and is responsible for rendering the condition in one or more *user interfaces* and sending *responses* back to the server. (See [below](#terminology) for the terminology used in stimsrv.)

A stimsrv task is simply a plain JS object with entries for `frontend`, and (optionally) the `controller` and other properties. Both `frontend` and `controller` are functions which recieve a context object and return a plain JS object specifying the behaviour. So the basic structure of a task looks like this:

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

The **`frontend`** entry of the task definition is a function that recieves a context object (see below, you can ignore this for simple tasks) and returns a plain JS object defining the task's user interfaces. The returned object needs to have an entry **`interfaces`**, which is another plain JS object containing an entry for each of the interfaces the task needs to show. These entries are matched with the `interfaces` of each client's role to determine which user interfaces should be shown on each client. 

Option |  | type | Description
-------|--|------|------------
**`interfaces`** | mandatory | Object | Plain JS object with an entry for each interface (e.g. `display`, `response` etc.).
`transformCondition` | optional | Function | Function `context => condition => condition`, returning an object with entries to extend / alter the condition on the client. The passed in `context` contains the device's and role's specific properties. The properties of the returned object will be added to the current condition object before passing it to each interface's `render()` function.

#### Entries for *frontend.interfaces*.

For each entry of `interfaces`, you can either use ready made components such as `canvasRenderer()` or `htmlButtons()`, or provide your own implementation. For custom interfaces, two methods need to be provided: **`initialize()`** which is called once when the task activates (and gets passed the parent DOM object and a reference to the stimsrv client API), and **`render()`**, which is called once for each new condition the task receives (which is passed as its parameter).

Entry | Description
------|------------
**`initialize(parent,stimsrvAPI)`** | This function is called once when the task becomes active, and gets passed the parent DOM element (the `<section>` element representing the interface area) and the stimsrv client API, which can be used to send responses, events or warnings to the server (see next section).
**`render(condition)`** | This function is called once for each new condition, and should update the interface accordingly.

#### stimsrv client API available to tasks

Each interface gets passed a stimsrv client instance in its `initialize()` method. This object provides methods for communicating with the stimsrv server.

Method | Description
-------|------------
**`response(responseData)`** | Send a response to the experiment controller. This will in turn generate a new condition, which will be sent out to all clients, or will advance to the next task (dependgin on the result of `nextCondition()` of the task controller, see below).
**`event(eventData)`** | Send an event to the experiment controller. Events will be broadcast to all clients, but will not change the state of the experiment.
**`warn(warningMessage,data)`** | Send an warning to the experiment controller. Warnings will be recorded in the experiment results. (Note: in case of a severe error, throw an exception instead)
**`getResourceURL(id,path)`** | Get the download URL for the resource with given id and (optional) path. Resources need to be registered at the experiment or task level, upon which they will be available at the URL returned by this method.

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



## Context & controllers

*(... coming soon ...)*



## Experiment settings & data storage

*(... coming soon ...)*



## Events

*(... coming soon ...)*

The [n-sided Pong example](https://github.com/floledermann/stimsrv-examples/tree/main/examples/pong) shows realtime event synchronization between clients in action.

[![3-sided Pong on stimsrv](https://img.youtube.com/vi/oe6Ff-pTMS4/0.jpg)](https://www.youtube.com/watch?v=oe6Ff-pTMS4)


<!--
## Available tasks

### Tasks provided as part of stimsrv

### Official extension tasks

### Tasks developed by 3rd parties
-->
<!--
## Experiments examples
-->



## Terminology & system overview

The following terms are used throughout this documentation to denote specific parts of a stimsrv experiment:

- ***Experiment***: All aspects contributing to an experiment, including client devices, data storage and the definition of tasks that should be run.
- ***User***: Usually the experiment designer or supervisor. *Not* necessarily the person participating in the experiment.
- ***Participant***: The person(s) participating in the experiment.
- ***Task***: Part of an experiment, usually presenting some stimulus or user interface to the participant and expecting some kind of response from them, potentially repeatedly. (Example: A simple task to assess the particpant's visual acuity may show letters of the alphabet in decreasing size  to the participant and ask the participant to respond by clicking an on-screen button corresponding to the shown letter). Multiple tasks can be run during an experiment.
- ***Configuration***: The structure and settings for all parts of the experiment and its tasks, defined in advance. The configuration does not change during an experiment run.
- ***Context***: The current circumstances under which a task is run. The context may change between one task and the next, but not during a single task.
- ***Trial***: A single run of a task. Usually, the participant is presented with a specific stimulus, and reacts with a specific response. (Example: in a single trial, above task may display the letter "B" to the participant, and wait for their response. For the next trial, a different letter may be displayed, and the text size may be adjusted depending on the participant's response.) A single task may run multiple trials before it is completed and the experiment continues with the next task.
- ***Condition***: A set of properties that define the setting for a trial. In the example above, the condition will specify the specific letter to be shown and the font size to use, potentially among other aspects of the presentation (e.g. contrast ratio etc.).
- ***Response***: A set of properties that define the response of the participant to the given condition, and will trigger the next condition (or the end of the task). In the example above, the response will contain information on which button was pressed. Responses can be classified with respect to the condition (i.e. whether the correct button corresponding to the letter shown has been pressed) and will be used to determine the next condition to be shown.
- ***Event***: Events are additional data gathered during a trial which do not immediately trigger a change of condition, but may be stored and/or processed.
- ***Result***: The result of a single trial. Contains information about the condition, the response, any events gathered during the trial plus additional information, such as timing information or the context in which a task was run.
- ***Task results, experiment results***: The collected results for the run of a task (multiple trials), or an entire experiment run.

### System overview

This graphics shows an overview of the flow of information in stimsrv.

![stimsrv overview](https://raw.githubusercontent.com/floledermann/stimsrv/main/docs/stimsrv-diagram-small.png)



## License, Credits & Acknowledgements

<img align="right" src="http://www.gnu.org/graphics/agplv3-with-text-100x42.png">

stimsrv is licensed under the [GNU Affero General Public License, Version 3](https://www.gnu.org/licenses/agpl-3.0.en.html). Roughly speaking, this license allows you to use and modify stimsrv free of charge, provided that you publish the modified or extended code under the same license.

(This isn't legal advice, please consider consulting a lawyer and see the [full license](https://www.gnu.org/licenses/agpl-3.0.en.html) for all details.)

If you need a different license for your purposes, contact the author of stimsrv (see below for contact information). Individual licenses and support may be available upon request.

**If you use stimsrv in research, please cite the following publication:**

----

**Ledermann, F. and Gartner, G.: *Towards Conducting Reproducible Distributed Experiments in the Geosciences*. Proceedings of the 24th AGILE Conference on Geographic Information Science, AGILE GIScience Series, 2, 33, https://doi.org/10.5194/agile-giss-2-33-2021, 2021.**

----

stimsrv is created by [Florian Ledermann](https://twitter.com/floledermann) at [TU Wien, Research Unit Cartography](https://cartography.tuwien.ac.at/).




