import { screen, currentIP } from "./src/index.js";

export default {
  
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
          viewingdistance: "natural-handheld"
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
          pixelsize: "puhd",
          pixeldensity: 801,
          viewingdistance: "natural-handheld"
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
          pixelsize: "phd",
          pixeldensity: 440,
          viewingdistance: "natural-handheld"
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
      id: "main",
      role: ["server","controller"]
    },
    {
      id: "kindle",
      role: "display"
    },
    {
      id: "pixel2",
      role: "display"
    },
    {
      role: "display",
      id: "*" // anyone who connects
    },
    {
      role: "buttons",
      id: "*" // anyone who connects
    }
  ]
  
}