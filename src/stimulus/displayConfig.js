
const Dimension = require("another-dimension");
const d3 = require("d3-interpolate");


function clamp(value, min=0, max=1) {
  if (value < min) {
    client.warn("Clamping intensity value " + value.toFixed(3) + " to 1.");
    return min;
  }
  if (value > max) {
    client.warn("Clamping intensity value " + value.toFixed(3) + " to 1.");
    return max;
  }
  return value;
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

function displayConfig(spec) {
  spec = Object.assign({
    minimumIntensityColor: "#000000",
    maximumIntensityColor: "#ffffff",
    highIntensity: 1.0,
    lowIntensity: 0.0,
    defaultPixelDensity: 96,
    defaultViewingDistance: 600,
    defaultGamma: 2.2,
    defautAmbientIntensity: 1/100,
    warnDefaults: msg => console.warn("No warning handler configured: " + msg)
  }, spec);
  
  function warn(val, message) {
    if (spec.warnDefaults && val !== undefined) {
      spec.warnDefaults(message);
    }
    return val;
  }
  
  return function(config) {
    
    function valFunc(name) {
      
      let defaultName = "default" + capitalize(name);
      
      return function(options) {
        
        let valSpec = val(name, options);
        // for performance reasons, check whether we have a fuction that needs the full object
        let dynamic = (typeof valSpec == "function");
      
        let v = undefined;
        if (dynamic) {
          // compose options by overlaying 
          options = Object.assign({}, spec, config, options);
          v = valSpec(options);
        }
        else {
          v = valSpec;
        }
        
        if (v !== undefined) return v;
        
        let defaultValue = config?.[defaultName] || spec?.[defaultName];
        
        return warn(defaultValue, "No value for " + name + " specified, using default of " + defaultValue + ".");
      }
    }
    
    // helper to retrieve a key from the provided options object, or the config or spec objects if not defined
    function val(name, options) {
      return options?.[name] || config?.[name] || spec?.[name];
    }
    
    let pixelDensity = valFunc("pixelDensity");
    let viewingDistance = valFunc("viewingDistance");
    let _gamma = valFunc("gamma");
    
    let gamma = function(options) {
      if (val("useGamma", options)) {
        return _gamma(options);
      }
      return val("defaultGamma");
    }
    
    let ambientIntensity = valFunc("ambientIntensity");
    
    function intensityToColorValue(intensity, options) {
      
      if (intensity === undefined) return intensity;
      
      if (! (typeof intensity == "number")) {
        warn(null, "Intensity value not specified as number. Using specified value " + intensity + " unchanged.");
      }
      
      options = Object.assign({}, spec, config, options);
      
      let colorInterpolator = d3.interpolateRgb;
      
      // don't use gamma for extremes (to avoid unneccessary warnings)
      if (intensity > 0 && intensity < 1) {
        colorInterpolator = colorInterpolator.gamma(gamma(options));
      }
      
      colorInterpolator = colorInterpolator(val("minimumIntensityColor"), val("maximumIntensityColor"));
      
      let realIntensity = val("lowIntensity") + intensity * (val("highIntensity") - val("lowIntensity")); 
      
      realIntensity = clamp(realIntensity);
      
      let colorValue = colorInterpolator(realIntensity);
      
      return colorValue;
    }
    
    function dimensionToScreenPixels(dimension, options) {
      Dimension.configure({
        pixelDensity: pixelDensity(options),
        viewingDistance: viewingDistance(options)
      });
      
      return Dimension(dimension, "px").toNumber("px");
    }
    
    // public API
    return {
      pixelDensity,
      viewingDistance,
      gamma,
      intensityToColorValue,
      dimensionToScreenPixels
    }
  }   
  
}

module.exports = displayConfig;