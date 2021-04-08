## stimsrv

**This is alpha software, not ready to use.**

stimsrv (***stim***ulus ***s***e***rv***er) is a system for running browser-based psychological experiments and user studies.

Main features:

- Implemented in JavaScript, leveraging a modern, function-based programming style.


To try out stimsrv, check out the [stimsrv examples repository](https://github.com/floledermann/stimsrv-examples). To implement your own experiment, you can start with the stimsrv experiment template (coming soon).

### Defining & running experiments

Experiments in stimsrv are implemented in JavaScript. Therefore, a single codebase defines both the user interface (which runs in a *client*, usually a web browser) and the flow of the experiment (which runs on a *server* (hence the name *stimsrv*), which potentialy controls and coordinates multiple clients). Stimsrv experiments can encompass multiple computers and laptops, mobile devices, older and simple devices, and printed media, all controlled from a single experiment definition.

stimsrv follows a [function-based](https://en.wikipedia.org/wiki/Functional_programming), [composition-over-inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance) programming style. This means that the dynamic behaviour of an experiment can be expressed concisely with [plain javascript objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects#using_object_initializers) (for configuration) and [functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) (for dynamic behaviour), without having to deal with complex APIs or class hierarchies. Even complex, distributed experiments can usually be implemented by creating an experiment definition, plus a single file for each task that is not provided elsewhere. stimsrv takes care of packaging and delivering the experiment code for web browsers, and coordinating multiple clients, among other things.

### Terminology

- ***Experiment***: All aspects contributing to an experiment, including client devices, data storage and the definition of tasks that should be run.
- ***Task***: Part of an experiment, usually presenting some stimulus to the user and expecting some kind of response from the user. (Example: A Task may show letters to the user and let the user respond with corresponding on-screen buttons) A sequence of tasks is run during an experiment.
- ***Configuration***: The structure and settings for all parts of the experiment and its tasks, defined in advance. The configuration does not change during an experiment run.
- ***Context***: The current circumstances under which a task is run. The context may change between one task and the next, but not during a single task.
- ***Trial***: A single run of a task. Usually, the user is presented with a specific stimulus, and reacts with a specific response. (Example: in a single trial, above task may display the letter "B" to the user, and wait for their response. For the next trial, another letter may be displayed.) A single task may run multiple trials, until a condition for going to the next task is met.
- ***Condition***: A set of properties that define the stimulus for a trial. In the example above, the condition specifies the specific letter to be shown, plus other aspects of the presentation (e.g. the font size to use, the contrast ratio etc.).
- ***Response***: A set of properties that define the response of the user. In the example above, the response will contain information on which button the user pressed. Responses can be classified with respect to the condition (i.e. whether the correct button corresponding to the letter shown has been pressed).
- ***Result***: The result of a trial contains the condition, the response plus additional information, such as timing information.


