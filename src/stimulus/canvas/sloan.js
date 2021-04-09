// Sloan Letters
// Based on https://en.wikipedia.org/wiki/File:ETDRS_Chart_R.svg (Public Domain)

// Converted from SVG with Canvg / http://www.professorcloud.com/svg-to-canvas/

const letters = ["C", "D", "H", "K", "N", "O", "R", "S", "V", "Z"];

const paths = {
  C: ctx => {
    ctx.moveTo(9.8974,5.9988);
    ctx.lineTo(7.818999999999999,5.9988);
    ctx.bezierCurveTo(7.39764,7.1578,6.3005,8.00100,4.9995,8.00100);
    ctx.bezierCurveTo(3.361,8.00100,1.9983,6.63830,1.9983,4.99960);
    ctx.bezierCurveTo(1.9983,3.36090,3.361,1.99840,4.9995,1.99840);
    ctx.bezierCurveTo(6.3003,1.99840,7.3974,2.84136,7.819,4.00060);
    ctx.lineTo(9.8974,4.00060);
    ctx.bezierCurveTo(9.43953,1.718505,7.4195,0,4.9996,0);
    ctx.bezierCurveTo(2.238199999999999,0,0,2.23840,0,4.99960);
    ctx.bezierCurveTo(0,7.760805,2.2382,9.99920,4.9996,9.99920);
    ctx.bezierCurveTo(7.4194,9.99920,9.4397,8.28070,9.8974,5.99880);
    ctx.closePath();
  },
  D: ctx => {
    ctx.moveTo(9.9992,5.9996);
    ctx.lineTo(9.9992,4.0012);
    ctx.bezierCurveTo(9.9992,1.7993,8.2007,0.0008,5.9988,0.0008);
    ctx.lineTo(0,0.0008);
    ctx.lineTo(0,10);
    ctx.lineTo(5.9988,10);
    ctx.bezierCurveTo(8.20070,10,9.9992,8.2015,9.9992,5.9996);
    ctx.closePath();
    ctx.moveTo(8.0008,5.9996);
    ctx.bezierCurveTo(8.0008,7.1004,7.09971,8.0018,5.9986,8.0018);
    ctx.lineTo(1.9987,8.0018);
    ctx.lineTo(1.9987,1.999299999999999);
    ctx.lineTo(5.9991,1.999299999999999);
    ctx.bezierCurveTo(7.0999,1.9993,8.0013,2.90039,8.0013,4.0015);
    ctx.closePath();
  },
  H: ctx => {
    ctx.moveTo(10,10);
    ctx.lineTo(10,0);
    ctx.lineTo(8.0006,0);
    ctx.lineTo(8.0006,3.9989);
    ctx.lineTo(1.999500,3.9989);
    ctx.lineTo(1.999500,0);
    ctx.lineTo(0.0001001103,0);
    ctx.lineTo(0.0001001103,10);
    ctx.lineTo(1.999500,10);
    ctx.lineTo(1.999500,6.0011);
    ctx.lineTo(8.0006,6.0011);
    ctx.lineTo(8.0006,10);
    ctx.closePath();
  },
  K: ctx => {
    ctx.moveTo(5.7409,3.2201);
    ctx.lineTo(9.9992,0);
    ctx.lineTo(6.6783,0);
    ctx.lineTo(1.998400,3.5398);
    ctx.lineTo(1.998400,0);
    ctx.lineTo(0,0);
    ctx.lineTo(0,10);
    ctx.lineTo(1.998400,10);
    ctx.lineTo(1.998400,6.0396);
    ctx.lineTo(4.01870,4.5209);
    ctx.lineTo(7.45960,10);
    ctx.lineTo(9.99920,10);
    ctx.closePath();
  },
  N: ctx => {
    ctx.moveTo(10,10);
    ctx.lineTo(10,0);
    ctx.lineTo(8.0014,0);
    ctx.lineTo(8.0014,6.9186);
    ctx.lineTo(1.9986000000000006,0);
    ctx.lineTo(0,0);
    ctx.lineTo(0,10);
    ctx.lineTo(1.9986,10);
    ctx.lineTo(1.9986,3.081400);
    ctx.lineTo(8.0014,10);
    ctx.closePath();
  },
  O: ctx => {
    ctx.moveTo(10,5);
    ctx.bezierCurveTo(10,2.2396,7.76040,0,5,0);
    ctx.bezierCurveTo(2.2396,0,0,2.2396,0,5);
    ctx.bezierCurveTo(0,7.76040,2.2396,10,5,10);
    ctx.bezierCurveTo(7.76040,10,10,7.76040,10,5);
    ctx.closePath();
    ctx.moveTo(7.9978,5);
    ctx.bezierCurveTo(7.9978,6.6378,6.6378,7.9978,5,7.9978);
    ctx.bezierCurveTo(3.3622,7.9978,2.0022,6.6378,2.0022,5);
    ctx.bezierCurveTo(2.0022,3.3622000000000005,3.3622,2.0022,5,2.0022);
    ctx.bezierCurveTo(6.6378,2.0022,7.9978,3.3622,7.9978,5);
    ctx.closePath();
  },
  R: ctx => {
    ctx.moveTo(10,10);
    ctx.lineTo(8.183,5.7581);
    ctx.translate(7.017036266176826,3.01240927243997);
    ctx.rotate(0);
    ctx.arc(0,0,2.983,1.1692202671320828,-0.004931053318863343,1);
    ctx.rotate(0);
    ctx.translate(-7.017036266176826,-3.01240927243997);
    ctx.translate(7.0019000150080055,2.997999984991995);
    ctx.rotate(0);
    ctx.arc(0,0,2.9981,-0.0001,-1.5706962684264127,1);
    ctx.rotate(0);
    ctx.translate(-7.0019,-2.998);
    ctx.lineTo(0,-0.0001);
    ctx.lineTo(0,9.9999);
    ctx.lineTo(2.0022,9.9999);
    ctx.lineTo(2.0022,6.001);
    ctx.lineTo(6.1226,6.001);
    ctx.lineTo(7.8185,9.9999);
    ctx.closePath();
    ctx.moveTo(7.9978,2.9978);
    ctx.bezierCurveTo(7.9978,3.54187,7.5578,3.9989,7.00224,3.9989);
    ctx.lineTo(2.00224,3.9989);
    ctx.lineTo(2.00224,2.0026);
    ctx.lineTo(7.00224,2.0026);
    ctx.bezierCurveTo(7.5578,2.0026,7.9978,2.459640,7.9978,2.99779);
    ctx.closePath();
  },
  S: ctx => {
    ctx.moveTo(10,3.0006);
    ctx.bezierCurveTo(10,2.19912,9.60074,1.441,9.18111,0.9606);
    ctx.lineTo(9.16074,0.9606);
    ctx.bezierCurveTo(8.4,0.10134,7.48004,0.00004,6.99964,0.00004);
    ctx.lineTo(3.000543,0.00004);
    ctx.bezierCurveTo(1.979042,0.00004,1.339443,0.5006,0.960543,0.8593);
    ctx.bezierCurveTo(-0.26056,1.9993,-0.35886,3.9612,0.960543,5.1593);
    ctx.bezierCurveTo(1.379983,5.54115,2.080344,6.00115,3.000543,6.00115);
    ctx.lineTo(6.99944,6.00115);
    ctx.bezierCurveTo(7.17870,6.00115,7.58092,6.099487,7.780745,6.33966);
    ctx.bezierCurveTo(8.13944,6.75929,8.07870,7.41896,7.65907,7.76036);
    ctx.bezierCurveTo(7.45944,7.91962,7.12092,8.00053,6.99944,8.00053);
    ctx.lineTo(3.000548,8.00053);
    ctx.bezierCurveTo(2.60128,8.00053,2.45943,7.939797,2.25980,7.74017);
    ctx.bezierCurveTo(2.06017,7.54055,1.99943,7.30036,1.99943,6.99943);
    ctx.lineTo(0.00003972893,6.99943);
    ctx.bezierCurveTo(0.00003972893,7.69943,0.2400396,8.55903,0.89984,9.18093);
    ctx.bezierCurveTo(1.519101,9.76000,2.23944,10.00000,3.000548,10.00000);
    ctx.lineTo(6.99944,10.00000);
    ctx.bezierCurveTo(8.07874,10.00000,8.57924,9.67868,9.18114,8.99870);
    ctx.bezierCurveTo(10.28054,7.780605,10.28924,5.90830,9.03929,4.820606);
    ctx.bezierCurveTo(8.68929,4.511155,8.02079,3.998934,6.99929,3.998934);
    ctx.lineTo(3.00039,3.998934);
    ctx.bezierCurveTo(2.71983,3.998934,2.41891,3.880412,2.23928,3.640053);
    ctx.bezierCurveTo(1.93854,3.26116,1.97039,2.69968,2.280021,2.34095);
    ctx.bezierCurveTo(2.470761,2.12096,2.821131,1.999453,3.000391,1.999453);
    ctx.lineTo(6.999291,1.999453);
    ctx.bezierCurveTo(7.120961,1.999453,7.6387315,2.239623,7.6387315,2.239623);
    ctx.bezierCurveTo(7.6387315,2.239623,8.000401,2.560754,8.000401,3.000732);
    ctx.closePath();
  },
  V: ctx => {
    ctx.moveTo(10,0);
    ctx.lineTo(7.8385,0);
    ctx.lineTo(5,7.12090037793);
    ctx.lineTo(2.1585,0);
    ctx.lineTo(0,0);
    ctx.lineTo(3.9989,10.0);
    ctx.lineTo(6.0011,10.0);
    ctx.closePath();
  },
  Z: ctx => {
    ctx.moveTo(10,10);
    ctx.lineTo(10,8.0006);
    ctx.lineTo(3.0787,8.0006);
    ctx.lineTo(10,1.9995);
    ctx.lineTo(10,0.0001);
    ctx.lineTo(0,0.0001);
    ctx.lineTo(0,1.9995);
    ctx.lineTo(6.9213,1.9995);
    ctx.lineTo(0,8.0006);
    ctx.lineTo(0,10);
    ctx.closePath();
  }
}



function pathAction(actionFunction) {
  
  return function(ctx, letter, size=20) {
    
    let pathFunction = paths[letter];
    
    if (!pathFunction) {
      throw "Unknown Letter: " + letter;
    }
    
    let scale = size / 10;
    
    ctx.save();
    
    ctx.lineWidth = 2;
    ctx.translate(-size/2, -size/2);
    ctx.scale(scale, scale);
    
    ctx.beginPath();
    pathFunction(ctx);
    
    actionFunction(ctx);
    
    ctx.restore();
  }
}

let stroke = pathAction(ctx => ctx.stroke());

let fill = pathAction(ctx => ctx.fill());

function strokeVanishingAction(backgroundColor, foregroundColor) {
  return pathAction(ctx => {
    ctx.strokeStyle = backgroundColor;
    ctx.stroke();
    ctx.strokeStyle = foregroundColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();   
  });
}

let strokeVanishingWBW = strokeVanishingAction("#ffffff", "#000000");

let strokeVanishingBWB = strokeVanishingAction("#000000", "#ffffff");

module.exports = {
  letters: letters,
  stroke: stroke,
  fill: fill,
  strokeVanishing: strokeVanishingAction,
  strokeVanishingWBW: strokeVanishingWBW,
  strokeVanishingBWB: strokeVanishingBWB,
  pathAction: pathAction
}