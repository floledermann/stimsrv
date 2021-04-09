## stimsrv

!! | This is alpha software, not ready to use. | !!
---|-------------------------------------------|---

stimsrv (***stim***ulus ***s***e***rv***er) is a system for running browser-based psychological experiments and user studies.

Main features:

- Implemented in JavaScript, leveraging a modern, function-based programming style and supporting seamless transition from server to client code.
- Run distributed experiments with multiple devices fulfilling different roles. For example, stimulus presentation can be performed by a desktop computer and participant feedback can be done on a tablet connected by WiFi.
- Central control of experiment state and unidirectional data flow for deterministic experiment behaviour even in complex, distributed settings.
- Provides wrappers and utility functions that help develop new experiment tasks with very little code, allowing you to focus on the core functionality (e.g. rendering the stimulus).
- Timestamp synchronization between multiple clients accomplishes temporal precision of a few milliseconds in local WiFi networks.
- Adaption of experiments to the device context, e.g. converting real-world measurements (millimeters, angular arcs) into appropriate pixel values depending on display resolution and viewing distance.
- Follows the design principle of “Simple things should be simple, complex things should be possible.” (Alan Kay)

To try out stimsrv, check out the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples). To implement your own experiment, you can start with the stimsrv experiment template (coming soon).

### Defining & running experiments

Experiments in stimsrv are implemented in JavaScript. Therefore, a single experiment specification defines both the user-facing side of the experiment (which runs in a *client*, usually a web browser) and the flow of the experiment (which is coordinated by the stimsrv *server*, which potentially controls and coordinates multiple clients). Stimsrv experiments can encompass multiple computers and laptops, mobile devices, uncommon devices such a e-book readers, and even printed media, all controlled from a single experiment definition.

To use stimsrv, install [Node.js](https://nodejs.org/) and run the following command on the command line in your project directory:

```
npm install stimsrv
```

(The *stimsrv experiment template* (coming soon) provides scripts for Windows to perform such tasks without using the command line.)

A minimal experiment definition file looks like this:

```javascript
// Load the "pause" task
const pause = require("stimsrv/tasks/pause");

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

After saving the file (e.g. as `my-experiment.js`), you can run this experiment from your project directory with:

```
npx stimsrv --open <experiment-file>
```

(Replace `<experiment-file>` with the name of your experiment file.)

This will start the stimsrv server and open a browser window (because of the `--open` parameter), showing the experiment start page. (Omit `--open` if you only want to start the server and want to start the client(s) manually.)

After choosing one of the two available *roles* in the web browser (whch are the defaults and can be changed), the experiment will display the message "Hello from stimsrv" and a "Continue" button (the default for the pause task). When the button is clicked, the experiment ends, the results are stored in the `data` folder inside your project directory, and the experiment is run again immediately (because by default `experiment.settings.loop` is `true`).

A more complex experiment that actually delivers useful data could look like this:

```javascript
const pause = require("stimsrv/tasks/pause");
const sloan = require("stimsrv/tasks/sloan");

module.exports = {
  
  name: "A small experiment to test visual acuity",
    
  tasks: [
  
    pause({
      message: "Press 'Continue' when you are ready to start the experiment"
    }),
    
    sloan({
      foregroundIntensity: 0,
      backgroundIntensity: 1,
      size:
        staircase({
          startValue: "5mm",
          stepSize: 1.2,
          stepType: "multiply",
          minReversals: 5
      })
    }),
    
    pause({
      message: context => "Your visual acuity was determined at: " + context.logMAR + "logMAR."
    }),
    
  ]
}
```

*(Note: currently the sloan task is not yet provided by stimsrv, so this is a hypothetical example!)*


<!-- ### Device configuration -->

<!-- ### Implementing tasks -->

<!-- ### Context & controllers -->


### Philosophy

Stimsrv follows a [function-based](https://en.wikipedia.org/wiki/Functional_programming), [composition-over-inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) programming style. This means that the dynamic behaviour of an experiment can be expressed concisely with [plain javascript objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#using_object_initializers) (for configuration) and [functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) (for dynamic behaviour), without having to deal with complex APIs or class hierarchies. Even complex, distributed experiments can usually be implemented by creating a single experiment definition file, plus one file for each task that you need to implement for your experiment. Because experiment definitions are JavaScript files, all features of the language (such as inline functions or iterators) can be used to configure an experiment. The stimsrv server takes care of packaging and delivering the experiment code for web browsers and coordinating multiple clients, among other things.

The hope is that by defining experiments in a concise yet comprehensive format, the details of an experiment will be less opaque and better reproducible, aiding the ideal of open and reproducible Science.

### Terminology

- ***Experiment***: All aspects contributing to an experiment, including client devices, data storage and the definition of tasks that should be run.
- ***Task***: Part of an experiment, usually presenting some stimulus to the participant and expecting some kind of response from them. (Example: A Task may show letters of the alphabet to the participant and let the participant respond with corresponding on-screen buttons). A sequence of tasks is run during an experiment.
- ***Configuration***: The structure and settings for all parts of the experiment and its tasks, defined in advance. The configuration does not change during an experiment run.
- ***Context***: The current circumstances under which a task is run. The context may change between one task and the next, but not during a single task.
- ***Trial***: A single run of a task. Usually, the participant is presented with a specific stimulus, and reacts with a specific response. (Example: in a single trial, above task may display the letter "B" to the participant, and wait for their response. For the next trial, another letter may be displayed.) A single task may run multiple trials, until a condition for going to the next task is met.
- ***Condition***: A set of properties that define the stimulus for a trial. In the example above, the condition specifies the specific letter to be shown, plus other aspects of the presentation (e.g. the font size to use, the contrast ratio etc.).
- ***Response***: A set of properties that define the response of the participant. In the example above, the response will contain information on which button was pressed. Responses can be classified with respect to the condition (i.e. whether the correct button corresponding to the letter shown has been pressed).
- ***Result***: The result of a trial contains the condition, the response plus additional information, such as timing information.


