const { screen } = require("./src/index.js");

module.exports = {
  
  devices: [
    {
      name: "Main PC",
      id: "main",
      ip: ".",
      fingerprint: "",
      mac: "",
      outputs: [
        "screen1",
        "screen2",
        "screen3",
        "audio"
      ],
      inputs: [
        "mouse",
        "keyboard"
      ]
    },
    {
      name: "Kindle Oasis",
      id: "kindle",
      //ip: ""
      // if IP not specified, offer menu on connect which role to fill
      outputs: [
        screen({
          pixelsize: "1199x1584", // TODO: check usable pixel size in browser
          pixeldensity: 301,
          viewingdistance: "handheld"
        })
      ],
      inputs: [
        "touch"
      ]
    },
    {
      name: "Sony Xperia Z5-P",
      id: "xperia",
      outputs: [
        screen({
          pixelsize: "uhd",
          pixeldensity: 801,
          viewingdistance: "handheld"
        }),
        "audio",
        "vibrate"
      ],
      inputs: [
        "touch",
        "geolocation",
        "deviceorientation",
        "devicemotion",
        //"devicelight" // FFx only
      ]      
    },
    {
      name: "Google Pixel2",
      id: "pixel2",
      ip: "192.168.0.37",
      outputs: [
        screen({
          pixelsize: "hd",
          pixeldensity: 440,
          viewingdistance: "handheld"
        }),
        "audio"
      ],
      inputs: [
        "touch",
        "geolocation"
      ]      
    }
  ],
  
  roles: [
    {
      device: "main",
      screen: "screen1",
      role: ["monitor", "control"],
      description: "Supervisor screen and experiment control"
    },
    {
      device: "main",
      screen: "screen2",
      role: "answer",
      description: "On-screen interface for subject feedback"
    },
    {
      device: "kindle",
      role: "display",
      description: "Stimulus display on Kindle Oasis e-reader"
    },
    {
      device: "pixel2",
      role: "display",
      description: "Stimulus display on Pixel2 phone"
    },
    {
      device: "xperia",
      role: "display",
      description: "Stimulus display on Xperia Z5-P phone"
    },
    /*
    {
      role: "buttons",
      device: "*" // anyone who connects
    }
    */
  ]
  
}