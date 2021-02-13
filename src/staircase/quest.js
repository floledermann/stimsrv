/*
Copyright (c) 1996-2002 Denis G. Pelli
Copyright (c) 1996-1999 David Brainard
Copyright (c) 2004-2007 Andrew D. Straw
Copyright (c) 2021 Florian Ledermann

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  a. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.
  b. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in the
     documentation and/or other materials provided with the distribution.
  c. Neither the name of the Enthought nor the names of its contributors
     may be used to endorse or promote products derived from this software
     without specific prior written permission.


THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/

/*
QUEST adaptive threshold method, ported to JavaScript from PsychoPy
https://github.com/psychopy/psychopy/blob/release/psychopy/contrib/quest.py
*/


function sum(arr) {
  return arr.reduce((a,b) => a+b, 0);
}

//def getinf(x):
//  return numpy.nonzero( numpy.isinf( numpy.atleast_1d(x) ) )

function anyInfinite(arr) {
  return arr.some(d => Array.isArray(d) ? anyInfinite(d) : !isFinite(d));
}

function nonzero(arr) {
  let indices = [];
  arr.forEach((d,i) => { if (d != 0) indices.push(i); });
  return indices;
}

function argsort(arr) {
  return arr.map((v,i) => [v, i]).sort().map(a => a[1]);
}

function last(arr) {
  return arr[arr.length-1];
}

function rangeArr(start, stop, step) {
  
  step = step || 1;
  
  let result = [];
  
  for (let i=start; i<stop; i+=step){
    result.push(i);
  }
  return result;
}

function arrayOp(scalarOp) {
  return function(a, b) {
    // treat single-element b as scalar
    if (Array.isArray(b) && b.length == 1) {
      b = b[0];
    }
    if (Array.isArray(a)) {
      if (Array.isArray(b)) {
        return a.map((x,i) => scalarOp(x, b[i]));
      }
      return a.map(x => scalarOp(x, b));
    }
    if (Array.isArray(b)) {
      return b.map(x => scalarOp(a, x))
    }
    return scalarOp(a, b);
  }
}

let mulA = arrayOp((a,b) => a * b);
let divA = arrayOp((a,b) => a / b);
let addA = arrayOp((a,b) => a + b);
let subA = arrayOp((a,b) => a - b);
let expA = arrayOp((a,b) => a ** b);

function interpolate(x, xValues, yValues) {
  
  if (x < xValues[0]) return yValues[0];
  if (x > last(xValues)) return last(yValues);
  
  let i=0;
  while(x > xValues[i+1]) {
    i++;
  }
  return yValues[i] + (yValues[i+1] - yValues[i]) * (x - xValues[i]) / (xValues[i+1] - xValues[i]);
}

function cumsum(arr) {
  let sum = 0;
  let result = [];
  
  for (let x of arr) {
    sum += x;
    result.push(sum);
  }
  return result;
}

function pick(arr, indexArr) {
  return indexArr.map(i => arr[i]);
}

/*
Measure threshold using a Weibull psychometric function.

Threshold 't' is measured on an abstract 'intensity' scale, which
usually corresponds to log10 contrast.

The Weibull psychometric function:

p2=delta*gamma+(1-delta)*(1-(1-gamma)*exp(-(10**(beta*(x2+xThreshold)))))

where x2 represents log10 intensity relative to threshold
(i.e., x2 = x - T, where x is intensity, and T is threshold intensity).
xThreshold shifts the psychometric function along the intensity axis
such that threshold performance (specified as pThreshold below) will
occur at intensity x = T, i.e., x2 = x - T = 0. In the 
Watson & Pelli (1983) paper, xThreshold is denoted as epsilon and used
to perform testing at the "ideal sweat factor".
The Weibull function itself appears only in recompute(), which uses
the specified parameter values in self to compute a psychometric
function and store it in self. All the other methods simply use
the psychometric function stored as instance
variables. recompute() is called solely by __init__() and
betaAnalysis() (and possibly by a few user programs). Thus, if
you prefer to use a different kind of psychometric function,
called Foo, you need only subclass QuestObject, overriding
__init__(), recompute(), and (if you need it) betaAnalysis().

instance variables:

tGuess is your prior threshold estimate.

tGuessSd is the standard deviation you assign to that guess.

pThreshold is your threshold criterion expressed as probability of
response==1. An intensity offset is introduced into the
psychometric function so that threshold (i.e. the midpoint of the
table) yields pThreshold.

beta, delta, and gamma are the parameters of a Weibull
psychometric function.

beta controls the steepness of the psychometric
function. Typically 3.5.

delta is the fraction of trials on which the observer presses
blindly.  Typically 0.01.

gamma is the fraction of trials that will generate response 1 when
intensity==-inf.

grain is the quantization of the internal table. E.g. 0.01.

range is the intensity difference between the largest and smallest
intensity that the internal table can store. E.g. 5. This interval
will be centered on the initial guess tGuess,
i.e. [tGuess-range/2, tGuess+range/2].  QUEST assumes that
intensities outside of this interval have zero prior probability,
i.e. they are impossible.

*/

function init(tGuess, tGuessSd, pThreshold, beta=3.5, delta=0.01, gamma=0.5, grain=0.01, range=null, options) {
  /*
  Initialize Quest parameters.

  Create an instance of QuestObject with all the information
  necessary to measure threshold.

  This was converted from the Psychtoolbox's QuestCreate function.
  */

  // instance variables
  let pdf,
      x,
      x2,
      p2,
      s2,
      i,
      xThreshold,
      intensities,
      responses,
      dim,
      quantileOrder
  ;
  // these are declared as constructor parameters:
  /*  
      tGuess,
      tGuessSd,
      pThreshold,
      beta,
      delta,
      gamma,
      grain,
      range
  */

  options = Object.assign({
    updatePdf: true,
    warnPdf: true,
    normalizePdf: false
  }, options);

  dim = 500;

  if (range) {
    if (range <= 0) {
      throw 'argument "range" must be greater than zero.';
    }
    dim = range / grain;
    dim = 2 * Math.ceil(dim/2.0); // round up to even integer
  }
    
  // public methods

  let quest = {
    
    get beta() { return beta; },
    get delta() { return delta; },
    get gamma() { return gamma; },
    
    setData: function(_intensities, _responses, options) {
      options = Object.assign({
        dim:500, 
        recompute: true
      }, options);
      
      intensities = _intensities;
      responses = _responses;
      
      dim = options.dim;
      
      if (options.recompute) {
        this.recompute();
      }
      
    },
    
    betaAnalysis: function(outputFunc) {
      /*
      Analyze the quest function with beta as a free parameter.

      It returns the mean estimates of alpha (as logC) and
      beta. Gamma is left at whatever value the user fixed it at.
      */
      
      outputFunc = outputFunc || console.log; 

      let q2 = [];
      
      for (let i=1; i<=17; i++) { //in range(1,17)
        let q_copy = init(tGuess, tGuessSd, pThreshold, 2 ** (i/4.0), delta, gamma, 0.02, range, options);
        q_copy.setData(intensities.slice(), responses.slice(), 250);
        q2.push(q_copy);
      }

      let t2    = q2.map(d => d.mean());              //numpy.array([q2i.mean() for q2i in q2]) 
      let p2    = q2.map((d, i) => d.pdfAt(t2[i]));  //numpy.array([q2i.pdfAt(t2i) for q2i,t2i in zip(q2,t2)])
      let sd2   = q2.map(d => d.sd());                //numpy.array([q2i.sd() for q2i in q2])
      let beta2 = q2.map(d => d.beta);                //numpy.array([q2i.beta for q2i in q2])
      
      let i = last(argsort(p2));
      let t = t2[i];
      let sd = q2[i].sd();
      let p = sum(p2);
      let betaMean = sum(mulA(p2,beta2))/p;
      let betaSd = Math.sqrt(sum(mulA(p2,expA(beta2,2)))/p-(sum(mulA(p2,beta2))/p)**2);
      let iBetaMean = sum(divA(p2,beta2))/p;
      let iBetaSd = Math.sqrt(sum(divA(p2,expA(beta2,2)))/p-(sum(divA(p2,beta2))/p)**2);
      
      outputFunc('logC  sd    beta  sd    gamma');
      outputFunc(t.toFixed(2) + "  " + sd.toFixed(2) + "  " + (1/iBetaMean).toFixed(2) + "  " + betaSd.toFixed(2) + "  " + gamma.toFixed(3));
      
    },

    mean: function() {
      /*
      Mean of Quest posterior pdf.

      Get the mean threshold estimate.
      */
      return tGuess + sum(mulA(pdf, x)) / sum(pdf);
    },
    
    mode: function() {
      /*
      Mode of Quest posterior pdf.

      let [t,p] = q.mode();
      't' is the mode threshold estimate
      'p' is the value of the (unnormalized) pdf at t.
      */
      let iMode = last(argsort(pdf));
      p = pdf[iMode];
      t = x[iMode] + tGuess;
      return [t, p];
    },
    
    p: function(x) {
      /*
      probability of correct response at intensity x.

      p=q.p(x)

      The probability of a correct (or yes) response at intensity x,
      assuming threshold is at x=0.
      */
      if (x < x2[0]) {
        return x2[0];
      }
      if (x > last(x2)) {
        return last(x2);
      }
      return interpolate(x, x2, p2);
    },
    
    pdfAt: function(t) {
      /*       
      The (unnormalized) probability density of candidate threshold 't'.

      This was converted from the Psychtoolbox's QuestPdf function.
      */
      let i = Math.round((t-tGuess)/grain) + 1 + dim/2;
      i = Math.min(pdf.length, Math.max(1,i)) - 1;
      p = pdf[i];
      return p;
    },
    
    quantile: function(_quantileOrder=null) {
      /*
      Get Quest recommendation for next trial level.

      intensity=q.quantile([quantileOrder])

      Gets a quantile of the pdf in the struct q.  You may specify
      the desired quantileOrder, e.g. 0.5 for median, or, making two
      calls, 0.05 and 0.95 for a 90confidence interval.  If the
      'quantileOrder' argument is not supplied, then it's taken from
      the QuestObject instance. __init__() uses recompute() to
      compute the optimal quantileOrder and saves that in the
      QuestObject instance; this quantileOrder yields a quantile
      that is the most informative intensity for the next trial.

      This was converted from the Psychtoolbox's QuestQuantile function.
      */
      _quantileOrder = _quantileOrder || quantileOrder;
      
      p = cumsum(pdf);
      
      if (!isFinite(last(p))) {
        throw "PDF is not finite";
      }
      if (last(p)==0) {
        throw "PDF is all zero";
      }
      
      let m1p = [-1].concat(p);
      
      let nonZeroIndices = nonzero(subA(p2.slice(1), p2.slice(0,-1)));
      
      if (nonZeroIndices.length < 2) {
        throw `PDF has only ${index.length} nonzero point(s)`;
      }
      
      let ires = interpolate(_quantileOrder*last(p), pick(p, nonZeroIndices), pick(x, nonZeroIndices))
      
      return tGuess + ires;
    },
    
    sd: function() {
      /*
      Standard deviation of Quest posterior pdf.

      Get the sd of the threshold distribution.

      This was converted from the Psychtoolbox's QuestSd function.
      */
      p = sum(pdf);
      sd = Math.sqrt(sum(mulA(pdf,expA(x,2)))/p-(sum(mulA(pdf,x))/p)**2);
      return sd;
    },
    
    simulate: function(tTest, tActual) {
      /*
      Simulate an observer with given Quest parameters.

      response=QuestSimulate(q,intensity,tActual)

      Simulate the response of an observer with threshold tActual.

      This was converted from the Psychtoolbox's QuestSimulate function.
      */
      t = Math.min( Math.max(tTest-tActual, x2[0]), last(x2) );
      response = interpolate(t,x2,p2) > Math.random() ? 1 : 0;
      return response;
    },
    
    recompute: function() {
      /*
      Recompute the psychometric function & pdf.

      Call this immediately after changing a parameter of the
      psychometric function. recompute() uses the specified
      parameters in 'self' to recompute the psychometric
      function. It then uses the newly computed psychometric
      function and the history in intensities and responses
      to recompute the pdf. (recompute() does nothing if q.updatePdf
      is False.)

      This was converted from the Psychtoolbox's QuestRecompute function.
      */
      if (!options.updatePdf) {
        return;
      }
      if (gamma > pThreshold) {
        warn( `reducing gamma from ${gamma.toFixed(2)} to 0.5`)
        gamma = 0.5;
      }
      i = rangeArr(-dim/2, dim/2+1);
      x = mulA(i, grain);
      //pdf = expA(Math.E, expA(mulA(-0.5, divA(x, tGuessSd)), 2));  // num.exp(-0.5*(x/tGuessSd)**2)
      pdf = x.map(x => Math.exp(-0.5*(x/tGuessSd)**2));
      pdf = divA(pdf, sum(pdf)); // self.pdf/num.sum(self.pdf)
      i2 = rangeArr(-dim, dim+1);
      x2 = mulA(i2, grain);
      //  p2 = delta*gamma+(1-delta)*(1-(1-gamma)*num.exp(-10**(beta*x2)))
      p2 = x2.map(x => delta*gamma+(1-delta)*(1-(1-gamma)*Math.exp(-(10**(beta*x)))))
      
      if (p2[0] >= pThreshold || last(p2) <= pThreshold) {
        throw `psychometric function range [${p2[0].toFixed(2)},${last(p2).toFixed(2)}] omits ${pThreshold.toFixed(2)} threshold`;
      }
      if (anyInfinite(p2)) {
        throw "Psychometric function p2 is not finite";
      }
      if (anyInfinite(pdf)) {
        throw "Prior pdf is not finite";
      }
      
      let nonZeroIndices = nonzero(subA(p2.slice(1), p2.slice(0,-1))); // strictly monotonic subset
      if (nonZeroIndices.length < 2) {
        throw `Psychometric function has only ${nonZeroIndices.length} strictly monotonic points`;
      }
      
      xThreshold = interpolate(pThreshold,pick(p2, nonZeroIndices),pick(x2, nonZeroIndices));
      
      //p2 = delta*gamma+(1-delta)*(1-(1-gamma)*numpy.exp(-10**(beta*(x2+xThreshold))));
      p2 = x2.map(x => delta*gamma+(1-delta)*(1-(1-gamma)*Math.exp(-(10**(beta*(x+xThreshold))))));
      
      if (anyInfinite(p2)) {
        throw "Psychometric function p2 is not finite";
      }
      
      s2 = [p2.map(v => 1-v).reverse(), p2.slice().reverse()];
      
      if (!intensities || !responses) {
        intensities = [];
        responses = [];
      }
      if (anyInfinite(s2)) {
        throw "Psychometric function s2 is not finite";
      }

      let eps = 1e-14;

      let pL = p2[0];
      let pH = last(p2);
      let pE = pH * Math.log(pH+eps) - pL * Math.log(pL+eps)+(1-pH+eps)*Math.log(1-pH+eps)-(1-pL+eps)*Math.log(1-pL+eps);
      pE = 1/(1+Math.exp(pE/(pL-pH)));
      
      quantileOrder = (pE-pL)/(pH-pL);
    
      // recompute the pdf from the historical record of trials
      
      for (let [index, intensity] of intensities.entries()) {
        
        let response = responses[index];
        
        intensity = Math.max(-1e10, Math.min(1e10, intensity)) // make intensity finite
        
        //let ii = pdf.length + i - Math.round((intensity-tGuess)/grain)-1;
        
        let ii = i.map(x => pdf.length + x - Math.round((intensity-tGuess)/grain)-1);
        
        if (ii[0] < 0) {
          ii = ii.map(x => x-ii[0]);
        }
        if (last(ii) >= s2[1].length) {
          ii = ii.map(x => x + s2[1].length - last(ii) - 1);
        }
        
        let iii = ii.map(x => Math.trunc(x)); // ii.astype(numpy.int_)
        if (ii.some((x,i) => Math.abs(x-iii[i]) > (1e-05 + 1e-08 * iii[i]))) {    //numpy.allclose(ii,iii)
          throw "Truncation error";
        }
        //pdf = pdf * s2[response,iii];
        pdf = mulA(pdf, iii.map(i => s2[response][i]));
        if (options.normalizePdf && ii.map(x => x % 100).every(x => x == 0)) {
          pdf = divA(pdf, sum(pdf)); // avoid underflow; keep the pdf normalized
        }
      }
      if (options.normalizePdf) {
        pdf = divA(pdf, sum(pdf)); // avoid underflow; keep the pdf normalized
      }
      if (anyInfinite(pdf)) {
        throw "Prior PDF is not finite";
      }
    },
    
    update: function(intensity, response) {
      /*
      Update Quest posterior pdf.

      Update self to reflect the results of this trial. The
      historical records intensities and responses are always
      updated, but self.pdf is only updated if self.updatePdf is
      true. You can always call QuestRecompute to recreate q.pdf
      from scratch from the historical record.

      This was converted from the Psychtoolbox's QuestUpdate function.
      */

      if (response < 0 || response > s2.length-1) { // CHECK - should be s2.length?
        throw `response ${response} out of range 0 to ${s2.length-1}`;
      }
      if (options.updatePdf) {
        inten = Math.max(-1e10, Math.min(1e10, intensity)); // make intensity finite
        ii = i.map(x => pdf.length + x - Math.round((inten - tGuess) / grain) - 1);
        if (ii[0] < 0 || last(ii) > s2[1].length) {
          if (options.warnPdf) {
            low = (1 - pdf.length - i[0]) * grain + tGuess;
            high = (s2[1].length - pdf.length - last(i)) * grain + tGuess;
            warn(`intensity ${intensity.toFixed(2)} out of range ${low.toFixed(2)} to ${high.toFixed(2)}. Pdf will be inexact.`);
          }
          if (ii[0]<0) {
            ii = ii.map(x => x-ii[0]);
          }
          else {
            ii = ii.map(x => x + s2[1].length - last(ii) - 1);
          }
        }
        let iii = ii.map(x => Math.trunc(x)); // ii.astype(numpy.int_)
        if (ii.some((x,i) => Math.abs(x-iii[i]) > (1e-05 + 1e-08 * iii[i]))) {    //numpy.allclose(ii,iii)
          throw "Truncation error";
        }
        //pdf = pdf * s2[response, iii];
        pdf = mulA(pdf, iii.map(i => s2[response][i]));
        
        if (options.normalizePdf) {
          pdf = divA(pdf, sum(pdf));
        }
      }
      // keep a historical record of the trials
      intensities.push(intensity);
      responses.push(response);
    }
  }
  
  quest.recompute();
  
  return quest;
}

init.demo = function(tActual, tGuess, tGuessSd=2.0, pThreshold=0.75) {
  /*
  Demo script for Quest routines.

  By commenting and uncommenting a few lines in this function, you
  can use this file to implement three QUEST-related procedures for
  measuring threshold.

  QuestMode: In the original algorithm of Watson & Pelli (1983) each
  trial and the final estimate are at the MODE of the posterior pdf.

  QuestMean: In the improved algorithm of King-Smith et al. (1994).
  each trial and the final estimate are at the MEAN of the posterior
  pdf.

  QuestQuantile & QuestMean: In the ideal algorithm of Pelli (1987)
  each trial is at the best QUANTILE, and the final estimate is at
  the MEAN of the posterior pdf.

  This was converted from the Psychtoolbox's QuestDemo function.

  King-Smith, P. E., Grigsby, S. S., Vingrys, A. J., Benes, S. C.,
  and Supowit, A.  (1994) Efficient and unbiased modifications of
  the QUEST threshold method: theory, simulations, experimental
  evaluation and practical implementation.  Vision Res, 34 (7),
  885-912.

  Pelli, D. G. (1987) The ideal psychometric
  procedure. Investigative Ophthalmology & Visual Science, 28
  (Suppl), 366.

  Watson, A. B. and Pelli, D. G. (1983) QUEST: a Bayesian adaptive
  psychometric method. Percept Psychophys, 33 (2), 113-20.
  */

  console.log('The intensity scale is abstract, but usually we think of it as representing log contrast.');
  console.log('True threshold of simulated observer: ' + tActual);
  console.log('Estimated threshold: ' + tGuess);
  
  let beta = 3.5;
  let delta = 0.01;
  let gamma = 0.5;
  
  q = init(tGuess, tGuessSd, pThreshold, beta, delta, gamma);

  // Simulate a series of trials.
  let trialsDesired = 40;
  let wrongRight = ['wrong', 'right'];
  
  for (let k=0; k < trialsDesired; k++) {
    // Get recommended level.  Choose your favorite algorithm.
    let tTest = q.quantile()
    //tTest=q.mean()
    //tTest=q.mode()

    //tTest = tTest + ([-0.1,0,0.1][Math.floor(Math.random()*3)]); // random choice

    // Simulate a trial
    let response = q.simulate(tTest,tActual);
    console.log(`Trial ${k+1} at ${tTest.toFixed(2)} is ${wrongRight[+response]}`);

    // Update the pdf
    q.update(tTest, response);
  }
  
  // Get final estimate.
  t = q.mean();
  sd = q.sd();
  
  console.log(`Mean threshold estimate is ${t.toFixed(2)} +/- ${sd.toFixed(2)}`);
  //t=QuestMode(q);
  //console.log('Mode threshold estimate is %4.2f'%t)
  console.log('\nQuest beta analysis. Beta controls the steepness of the Weibull function.\n');
  
  console.log('Now re-analyzing with beta as a free parameter ...');
  q.betaAnalysis();
  console.log();
  console.log('Actual parameters of simulated observer:');
  console.log('logC  beta  gamma');
  console.log(tActual.toFixed(2) + "  " + q.beta.toFixed(2) + "  " + q.gamma.toFixed(2));
}


module.exports = init;
