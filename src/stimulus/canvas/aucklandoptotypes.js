// Auckland Optotypes CC-BY-NC-SA Dakin Lab
// https://github.com/dakinlab/OpenOptotypes

// Converted from SVG with Canvg / http://www.professorcloud.com/svg-to-canvas/

const shapeNames = ["butterfly", "car", "duck", "flower", "heart", "house", "moon", "rabbit", "rocket", "tree"];

const paths = {
  butterfly: ctx => {
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.moveTo(35.67,19.72);
    ctx.translate(16.62054487536132,8.61501195613534);
    ctx.arc(0,0,22.05,0.5277926288168654,-0.007030078593030065,1);
    ctx.translate(-16.62054487536132,-8.61501195613534);
    ctx.bezierCurveTo(38.48,5.54,36.88,2.46,33.54,2.46);
    ctx.bezierCurveTo(29.84,2.46,26.45,5.76,25.06,8.72);
    ctx.bezierCurveTo(23.89,11.22,24.65,15.39,20.68,15.52);
    ctx.bezierCurveTo(16.68,15.39,17.31,11.22,16.14,8.72);
    ctx.bezierCurveTo(14.76,5.72,11.37,2.51,7.67,2.46);
    ctx.bezierCurveTo(4.32,2.46,2.72,5.46,2.54,8.46);
    ctx.translate(24.58945512463868,8.61501195613534);
    ctx.arc(0,0,22.05,-3.1345625749967656,-3.669385282406661,1);
    ctx.translate(-24.58945512463868,-8.61501195613534);
    ctx.bezierCurveTo(7.92,23.72,3.674,26.51,4.48,30.57);
    ctx.bezierCurveTo(5.08,33.57,7.95,38.31,11.35,38.62);
    ctx.bezierCurveTo(14.75,38.93,16.26,31.99,17.52,29.75);
    ctx.translate(20.64,32.10662894830731);
    ctx.arc(0,0,3.91,-2.494689195867594,-0.6469034577221993,0);
    ctx.translate(-20.64,-32.10662894830731);
    ctx.bezierCurveTo(25,32,26.32,39,29.86,38.63);
    ctx.bezierCurveTo(33.4,38.26,36.13,33.56,36.73,30.58);
    ctx.bezierCurveTo(37.54,26.51,33.29,23.76,35.67,19.72);
    ctx.closePath();
  },
  car: ctx => {
    ctx.lineJoin = "round";
    ctx.moveTo(26.11,2.52);
    ctx.translate(25.345281403704412,19.202481993650697);
    ctx.arc(0,0,16.7,-1.5249887758570422,-1.0329837414677383,0);
    ctx.translate(-25.345281403704412,-19.202481993650697);
    ctx.translate(32.46101917550894,6.830516223416349);
    ctx.arc(0,0,2.44,-0.9400517420307936,-0.028904116043253048,0);
    ctx.translate(-32.46101917550894,-6.830516223416349);
    ctx.bezierCurveTo(35.08,8.7,35.39,10.62,35.66,12.55);
    ctx.bezierCurveTo(35.96,14.65,36.31,16.75,36.66,18.84);
    ctx.bezierCurveTo(37.11,21.56,37.59,24.28,38.05,27);
    ctx.bezierCurveTo(38.31,28.51,38.31,30,38.61,31.55);
    ctx.bezierCurveTo(38.67,31.84,38.54,31.96,38.26,31.96);
    ctx.bezierCurveTo(37.76,31.96,37.26,31.96,36.76,31.96);
    ctx.bezierCurveTo(36.26,31.96,36.26,32.11,36.24,32.49);
    ctx.translate(28.90262912677545,32.293560012329074);
    ctx.arc(0,0,7.34,0.026766136978236158,0.6354260164300258,0);
    ctx.translate(-28.90262912677545,-32.293560012329074);
    ctx.translate(31.025,34.124871290409146);
    ctx.arc(0,0,4.55,0.588330920771822,2.553261732817971,0);
    ctx.translate(-31.025,-34.124871290409146);
    ctx.translate(33.19691613992306,32.276528826901455);
    ctx.arc(0,0,7.39,2.508291010604002,3.1127021431673203,0);
    ctx.translate(-33.19691613992306,-32.276528826901455);
    ctx.bezierCurveTo(25.81,32.10,25.66,31.97,25.27,31.97);
    ctx.bezierCurveTo(22.27,31.97,19.27,31.97,16.32,31.97);
    ctx.bezierCurveTo(15.73,31.97,15.74,32.39,15.72,32.73);
    ctx.translate(8.58770895340235,32.398300698488754);
    ctx.arc(0,0,7.14,0.04647321149157074,0.6731952221055846,0);
    ctx.translate(-8.58770895340235,-32.398300698488754);
    ctx.translate(10.568401192479302,34.16884613838268);
    ctx.arc(0,0,4.49,0.639929565516815,2.2183127330175636,0);
    ctx.translate(-10.568401192479302,-34.16884613838268);
    ctx.translate(11.847420855259653,32.66747356887933);
    ctx.arc(0,0,6.46,2.2360361176207353,3.1133340272538996,0);
    ctx.translate(-11.847420855259653,-32.66747356887933);
    ctx.bezierCurveTo(5.32,32.04,5.3,31.98,4.47,31.98);
    ctx.bezierCurveTo(3.99,31.98,3.47,31.98,3.03,31.98);
    ctx.bezierCurveTo(2.59,31.98,2.5,31.80,2.49,31.41);
    ctx.translate(16.08495754562829,31.780309779190862);
    ctx.arc(0,0,13.6,-3.114360627677659,-2.925931445699412,0);
    ctx.translate(-16.08495754562829,-31.780309779190862);
    ctx.quadraticCurveTo(3.3,25.54,3.8,22.22);
    ctx.bezierCurveTo(4,20.91,4.19,19.59,4.43,18.28);
    ctx.bezierCurveTo(4.67,17.36,5.08,17.06,6.43,16.98);
    ctx.bezierCurveTo(8.43,16.85,10.43,16.75,12.43,16.60);
    ctx.bezierCurveTo(12.99,16.60,13.54,16.48,14.16,16.49);
    ctx.bezierCurveTo(14.48,16.49,14.66,16.32,14.73,15.93);
    ctx.translate(-41.21926873408252,6.550648843261268);
    ctx.arc(0,0,56.73,0.16609582844883047,0.037896451698481104,1);
    ctx.translate(41.21926873408252,-6.550648843261268);
    ctx.translate(22.951828055654357,8.350215858530804);
    ctx.arc(0,0,7.49,3.0948755097498815,3.5639465731998268,0);
    ctx.translate(-22.951828055654357,-8.350215858530804);
    ctx.translate(19.042387987712022,6.812856304183948);
    ctx.arc(0,0,3.3,-2.6585205749444394,-1.6991447842464604,0);
    ctx.translate(-19.042387987712022,-6.812856304183948);
    ctx.bezierCurveTo(20.32,3.254,22.02,2.956,23.74,2.734);
    ctx.translate(25.851111170346762,13.076826065341836);
    ctx.arc(0,0,10.56,-1.772068343227867,-1.5462778826516272,0);
    ctx.translate(-25.851111170346762,-13.076826065341836);
    ctx.closePath();
  },
  duck: ctx => {
    ctx.lineJoin = "round";
    ctx.moveTo(22,38.63);
    ctx.translate(21.14218980180591,15.475884563130592);
    ctx.arc(0,0,23.17,1.5337654126621931,2.0533655423018216,0);
    ctx.translate(-21.14218980180591,-15.475884563130592);
    ctx.translate(17.060802282136756,23.181930843038835);
    ctx.arc(0,0,14.45,2.0506475619351456,2.8806433167322707,0);
    ctx.translate(-17.060802282136756,-23.181930843038835);
    ctx.translate(19.18258775704703,22.485887542468994);
    ctx.arc(0,0,16.68,2.8731454665215703,3.198931474240545,0);
    ctx.translate(-19.18258775704703,-22.485887542468994);
    ctx.translate(12.292537212609773,22.114180770318043);
    ctx.arc(0,0,9.78,-3.0818248912525688,-2.7074057598860333,0);
    ctx.translate(-12.292537212609773,-22.114180770318043);
    ctx.translate(15.27413336921352,22.501324478961557);
    ctx.arc(0,0,12.68,-2.77868495718782,-2.515396859506648,0);
    ctx.translate(-15.27413336921352,-22.501324478961557);
    ctx.translate(8.063384959209403,17.401988977608944);
    ctx.arc(0,0,3.85,-2.490932988445931,-2.2718654825926423,0);
    ctx.translate(-8.063384959209403,-17.401988977608944);
    ctx.translate(6.3314022520415705,15.119844417743197);
    ctx.arc(0,0,1,-2.420980967431733,-0.5941980223631405,0);
    ctx.translate(-6.3314022520415705,-15.119844417743197);
    ctx.bezierCurveTo(7.84,15.26,8.48,16,9.16,16.69);
    ctx.translate(13.997358611803257,11.840003952495135);
    ctx.arc(0,0,6.85,2.354889961868847,1.5718705768997987,1);
    ctx.translate(-13.997358611803257,-11.840003952495135);
    ctx.translate(14.6097046795129,3.4425882160220453);
    ctx.arc(0,0,15.26,1.6114172401085078,1.2864905394414503,1);
    ctx.translate(-14.6097046795129,-3.4425882160220453);
    ctx.bezierCurveTo(19.35,17.95,19.44,17.74,19.3,17.31);
    ctx.translate(12.679231328832934,19.956190129770093);
    ctx.arc(0,0,7.13,-0.3802306548610979,-0.7283843375420058,1);
    ctx.translate(-12.679231328832934,-19.956190129770093);
    ctx.translate(23.157813335755066,11.06013715967537);
    ctx.arc(0,0,6.62,2.464066510118783,3.16729596097988,0);
    ctx.translate(-23.157813335755066,-11.06013715967537);
    ctx.translate(24.316881161485703,11.110271196775267);
    ctx.arc(0,0,7.78,-3.11327637652974,-2.5073348305914473,0);
    ctx.translate(-24.316881161485703,-11.110271196775267);
    ctx.translate(25.6844110577041,11.669542320361195);
    ctx.arc(0,0,9.22,-2.5463763326543,-1.8044135011224465,0);
    ctx.translate(-25.6844110577041,-11.669542320361195);
    ctx.translate(25.216838834377434,9.683841944102923);
    ctx.arc(0,0,7.18,-1.805084079173461,-0.8584073523320144,0);
    ctx.translate(-25.216838834377434,-9.683841944102923);
    ctx.translate(20.41182407296351,16.027162394187513);
    ctx.arc(0,0,15.13,-0.8921099476246023,-0.5987290049237133,0);
    ctx.translate(-20.41182407296351,-16.027162394187513);
    ctx.translate(35.27767290545918,5.825447817249499);
    ctx.arc(0,0,2.9,2.526013102684412,1.6321012389995977,1);
    ctx.translate(-35.27767290545918,-5.825447817249499);
    ctx.bezierCurveTo(35.81,8.8,36.53,8.82,37.24,8.850);
    ctx.bezierCurveTo(38.4,8.850,38.88,9.57,38.53,10.700);
    ctx.translate(32.039151956527675,8.639662242118664);
    ctx.arc(0,0,6.81,0.3073626340394922,0.9733502961021911,0);
    ctx.translate(-32.039151956527675,-8.639662242118664);
    ctx.bezierCurveTo(34.87,14.99,33.78,15.58,32.74,16.27);
    ctx.bezierCurveTo(32.4,16.48,32.29,16.6,32.59,16.98);
    ctx.bezierCurveTo(33.75,18.42,34.95,19.82,35.97,21.37);
    ctx.translate(27.717766488248127,27.227904238507087);
    ctx.arc(0,0,10.12,-0.6173106921754122,0.09719800904542986,0);
    ctx.translate(-27.717766488248127,-27.227904238507087);
    ctx.translate(28.15646381007427,27.26269831764579);
    ctx.arc(0,0,9.68,0.0980186234438745,0.7330546077041632,0);
    ctx.translate(-28.15646381007427,-27.26269831764579);
    ctx.bezierCurveTo(32.86,36.5,29.60,37.74,26.06,38.31);
    ctx.translate(22.387720553677212,17.63357952477956);
    ctx.arc(0,0,21,1.395022137763919,1.589260259396277,0);
    ctx.translate(-22.387720553677212,-17.63357952477956);
    ctx.closePath();
  },
  flower: ctx => {
    ctx.lineJoin = "round";
    ctx.moveTo(13.95,29);
    ctx.translate(4.827999664646244,14.08894672124715);
    ctx.arc(0,0,17.48,1.021773909478329,1.1636446669043183,0);
    ctx.translate(-4.827999664646244,-14.08894672124715);
    ctx.translate(9.223917841382635,23.762029403649226);
    ctx.arc(0,0,6.86,1.1936879751733855,1.9148498372109666,0);
    ctx.translate(-9.223917841382635,-23.762029403649226);
    ctx.translate(9.696410641491564,23.570186789316367);
    ctx.arc(0,0,7.21,1.9675917329585348,3.456069016027675,0);
    ctx.translate(-9.696410641491564,-23.570186789316367);
    ctx.translate(8.4913883608328,22.851393262868253);
    ctx.arc(0,0,5.85,-2.880270727820835,-1.9126988091749784,0);
    ctx.translate(-8.4913883608328,-22.851393262868253);
    ctx.bezierCurveTo(7.53,16.99,8.53,16.68,9.63,16.45);
    ctx.translate(22.094119906320056,2.6209537717272973);
    ctx.arc(0,0,18.58,2.306130882397574,2.474259092931957,0);
    ctx.translate(-22.094119906320056,-2.6209537717272973);
    ctx.translate(12.366351276887915,10.246109804094678);
    ctx.arc(0,0,6.22,2.4692609608259866,3.2456565493018674,0);
    ctx.translate(-12.366351276887915,-10.246109804094678);
    ctx.translate(13.204316241058812,10.486217436974346);
    ctx.arc(0,0,7.08,-3.0160915068094427,-2.159994272304682,0);
    ctx.translate(-13.204316241058812,-10.486217436974346);
    ctx.translate(13.66807270590198,10.262672202555962);
    ctx.arc(0,0,7.17,-2.231153860503292,-1.3239559573137392,0);
    ctx.translate(-13.66807270590198,-10.262672202555962);
    ctx.translate(13.349826628101251,10.633010460888432);
    ctx.arc(0,0,7.61,-1.2952909448256116,-0.4827977222111205,0);
    ctx.translate(-13.349826628101251,-10.633010460888432);
    ctx.lineTo(20.6,8);
    ctx.bezierCurveTo(21.02,7.22,21.37,6.5,21.8,5.82);
    ctx.translate(27.73404510464952,9.533099607603468);
    ctx.arc(0,0,7,-2.58246983044312,-1.2411506088996949,0);
    ctx.translate(-27.73404510464952,-9.533099607603468);
    ctx.translate(27.624894964122934,9.950154548626859);
    ctx.arc(0,0,7.43,-1.2454212512285383,-0.36327466326176994,0);
    ctx.translate(-27.624894964122934,-9.950154548626859);
    ctx.translate(29.187732062713987,9.444312969379832);
    ctx.arc(0,0,5.79,-0.37752463065180136,0.674454041145738,0);
    ctx.translate(-29.187732062713987,-9.444312969379832);
    ctx.bezierCurveTo(33.16,13.82,32.5,14.48,31.87,15.290);
    ctx.bezierCurveTo(32.39,15.360,32.87,15.4,33.34,15.48);
    ctx.translate(32.20713626372293,23.30845577077806);
    ctx.arc(0,0,7.91,-1.4270829564300689,-0.8646477330984511,0);
    ctx.translate(-32.20713626372293,-23.30845577077806);
    ctx.translate(33.3716674230271,21.86994940567421);
    ctx.arc(0,0,6.06,-0.8568249557221435,0.17415468932335054,0);
    ctx.translate(-33.3716674230271,-21.86994940567421);
    ctx.translate(31.84445289429178,22.20050463093284);
    ctx.arc(0,0,7.53,0.09569650888387038,0.944196359523531,0);
    ctx.translate(-31.84445289429178,-22.20050463093284);
    ctx.translate(32.180123391438485,22.391784799204366);
    ctx.arc(0,0,7.18,0.9664455853315674,1.8983673976280717,0);
    ctx.translate(-32.180123391438485,-22.391784799204366);
    ctx.translate(32.79430431965335,17.97498576701497);
    ctx.arc(0,0,11.59,1.8258658787804938,2.0230065327442026,0);
    ctx.translate(-32.79430431965335,-17.97498576701497);
    ctx.translate(13.81502495042156,31.022798003966265);
    ctx.arc(0,0,14.16,-0.18630168198340333,0.02664171055892947,0);
    ctx.translate(-13.81502495042156,-31.022798003966265);
    ctx.translate(21.313309965755163,31.190052892409902);
    ctx.arc(0,0,6.66,0.031528813089090585,1.2010650617030514,0);
    ctx.translate(-21.313309965755163,-31.190052892409902);
    ctx.translate(20.563826014386773,29.464625669034994);
    ctx.arc(0,0,8.54,1.1922442907251845,1.834234013876856,0);
    ctx.translate(-20.563826014386773,-29.464625669034994);
    ctx.translate(19.819561593412732,31.802462654261255);
    ctx.arc(0,0,6.09,1.8162014793892403,2.690024283950049,0);
    ctx.translate(-19.819561593412732,-31.802462654261255);
    ctx.translate(21.098178098122066,31.445530097336633);
    ctx.arc(0,0,7.4,2.722030306863397,3.234364875561271,0);
    ctx.translate(-21.098178098122066,-31.445530097336633);
    ctx.bezierCurveTo(13.87,30.18,13.91,29.61,13.95,29);
    ctx.closePath();
  },
  heart: ctx => {
    ctx.lineJoin = "round";
    ctx.moveTo(38.59,12.48);
    ctx.bezierCurveTo(37.73,1.06,26.13,-0.90,20.59,8.38);
    ctx.bezierCurveTo(15,-0.91,3.42,1.06,2.55,12.48);
    ctx.bezierCurveTo(1.84,21.87,8.14,29.3,14.77,34.79);
    ctx.translate(36.23006365415467,8.75438462490986);
    ctx.arc(0,0,33.74,2.2601546944620803,2.0534591077476585,1);
    ctx.translate(-36.23006365415467,-8.75438462490986);
    ctx.translate(5.059548676093119,8.924409820285994);
    ctx.arc(0,0,33.52,1.0897327573699274,0.8814257053567457,1);
    ctx.translate(-5.059548676093119,-8.924409820285994);
    ctx.bezierCurveTo(33,29.3,39.3,21.87,38.59,12.48);
    ctx.closePath();
  },
  house: ctx => {
    ctx.lineJoin = "round";
    ctx.moveTo(38.64,16.55);
    ctx.translate(37.82082693591685,16.416375559568543);
    ctx.arc(0,0,0.83,0.1616970006257264,-1.0413821662571967,1);
    ctx.translate(-37.82082693591685,-16.416375559568543);
    ctx.translate(43.38505007275668,8.242650621780786);
    ctx.arc(0,0,9.06,2.1747319735610486,2.299791218197661,0);
    ctx.translate(-43.38505007275668,-8.242650621780786);
    ctx.lineTo(28.81,8.55);
    ctx.lineTo(20.9,2.55);
    ctx.translate(20.57,3.493980932010812);
    ctx.arc(0,0,1,-1.234492751640916,-1.9070999019488768,1);
    ctx.translate(-20.57,-3.493980932010812);
    ctx.lineTo(12.33,8.55);
    ctx.lineTo(3.79,15);
    ctx.translate(-2.207884262534373,8.289904294777719);
    ctx.arc(0,0,9,0.8413840216191387,0.9672780938017378,0);
    ctx.translate(2.207884262534373,-8.289904294777719);
    ctx.translate(3.319173064083152,16.416375559568543);
    ctx.arc(0,0,0.83,-2.100210487332595,-3.303289654215521,1);
    ctx.translate(-3.319173064083152,-16.416375559568543);
    ctx.quadraticCurveTo(2.5,21.22,2.5,25.9);
    ctx.bezierCurveTo(2.5,29.9,2.5,33.9,2.5,37.83);
    ctx.bezierCurveTo(2.5,38.48,2.66,38.64,3.33,38.63);
    ctx.bezierCurveTo(6.86,38.63,10.33,38.63,13.89,38.63);
    ctx.bezierCurveTo(14.51,38.63,14.67,38.45,14.66,37.85);
    ctx.bezierCurveTo(14.66,34.93,14.66,29.85,14.66,26.85);
    ctx.bezierCurveTo(14.66,26.32,14.85,26.15,15.4,26.17);
    ctx.lineTo(20.54,26.17);
    ctx.lineTo(20.63,26.17);
    ctx.lineTo(25.77,26.17);
    ctx.bezierCurveTo(26.32,26.17,26.51,26.32,26.51,26.85);
    ctx.bezierCurveTo(26.51,29.77,26.51,34.85,26.51,37.85);
    ctx.bezierCurveTo(26.51,38.45,26.66,38.64,27.28,38.63);
    ctx.bezierCurveTo(30.81,38.63,34.28,38.63,37.84,38.63);
    ctx.bezierCurveTo(38.51,38.63,38.67,38.48,38.67,37.83);
    ctx.bezierCurveTo(38.67,33.83,38.67,29.83,38.67,25.9);
    ctx.quadraticCurveTo(38.64,21.23,38.64,16.55);
    ctx.closePath();
  },
  moon: ctx => {
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.moveTo(27.81,25.33);
    ctx.translate(31.21083167381994,19.534075231134977);
    ctx.arc(0,0,6.72,2.101425553030782,2.7498127694700765,0);
    ctx.translate(-31.21083167381994,-19.534075231134977);
    ctx.translate(29.95823557326596,20.5);
    ctx.arc(0,0,5.21,2.82944656198632,3.453738745193266,0);
    ctx.translate(-29.95823557326596,-20.5);
    ctx.translate(31.217245371386518,21.45034507311715);
    ctx.arc(0,0,6.72,-2.7523199453638423,-2.105988966304473,0);
    ctx.translate(-31.217245371386518,-21.45034507311715);
    ctx.bezierCurveTo(29.62,14.34,37.1,10.81,38.22,9.58);
    ctx.bezierCurveTo(38.74,9.01,38.78,8.63,38.22,8.16);
    ctx.bezierCurveTo(37.98,7.95,37.37,7.33,37.12,7.16);
    ctx.translate(23.365088087534925,25.1299554334541);
    ctx.arc(0,0,22.63,-0.9174870063941907,-1.568811707177237,1);
    ctx.translate(-23.365088087534925,-25.1299554334541);
    ctx.translate(23.326917895676466,23.599836429791132);
    ctx.arc(0,0,21.1,-1.5668587761308064,-1.788964524163451,1);
    ctx.translate(-23.326917895676466,-23.599836429791132);
    ctx.translate(22.286462517848,23.478585451886403);
    ctx.arc(0,0,20.78,-1.741326285739298,-2.479274705287365,1);
    ctx.translate(-22.286462517848,-23.478585451886403);
    ctx.translate(18.650086207364744,20.612507336933838);
    ctx.arc(0,0,16.15,-2.480756054545517,-3.0807186967955644,1);
    ctx.translate(-18.650086207364744,-20.612507336933838);
    ctx.bezierCurveTo(2.530,19.9,2.530,20.42,2.530,20.42);
    ctx.lineTo(2.530,20.42);
    ctx.bezierCurveTo(2.530,20.42,2.530,20.42,2.530,20.49);
    ctx.bezierCurveTo(2.530,20.49,2.530,20.49,2.530,20.56);
    ctx.lineTo(2.530,20.56);
    ctx.bezierCurveTo(2.530,20.56,2.530,21.09,2.530,21.35);
    ctx.translate(18.651393023360825,20.38917380014235);
    ctx.arc(0,0,16.15,3.082063618574924,2.4808879007853797,1);
    ctx.translate(-18.651393023360825,-20.38917380014235);
    ctx.translate(22.286462517848,17.521414548113597);
    ctx.arc(0,0,20.78,2.4792747052873656,1.7413262857392984,1);
    ctx.translate(-22.286462517848,-17.521414548113597);
    ctx.translate(23.101071036119627,17.39226596009733);
    ctx.arc(0,0,21.06,1.778413394925527,1.5561268090294418,1);
    ctx.translate(-23.101071036119627,-17.39226596009733);
    ctx.translate(23.40105092552876,15.810001768682362);
    ctx.arc(0,0,22.64,1.5704010496436474,0.9198234028612562,1);
    ctx.translate(-23.40105092552876,-15.810001768682362);
    ctx.bezierCurveTo(37.37,33.63,37.98,33.01,38.22,32.82);
    ctx.bezierCurveTo(38.80,32.34,38.76,31.97,38.22,31.4);
    ctx.bezierCurveTo(37.13,30.19,29.65,26.66,27.81,25.33);
    ctx.closePath();
  },
  rabbit: ctx => {
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.moveTo(36,23);
    ctx.bezierCurveTo(34.41,21.44,31.41,21.14,32.54,18.39);
    ctx.translate(3.510179714451059,6.553951918451339);
    ctx.arc(0,0,31.35,0.3871440706905086,0.08386375860063416,1);
    ctx.translate(-3.510179714451059,-6.553951918451339);
    ctx.translate(27.561288838673992,8.508559876811903);
    ctx.arc(0,0,7.22,0.09313181896444417,-0.71775508751846,1);
    ctx.translate(-27.561288838673992,-8.508559876811903);
    ctx.bezierCurveTo(31.87,2.76,31.38,2.17,29.7,2.71);
    ctx.bezierCurveTo(26.37,3.76,25.43,6.28,24.83,9.13);
    ctx.bezierCurveTo(24.47,10.83,24.41,13.46,23.59,14.7);
    ctx.translate(20.29863372265538,12.570843352789973);
    ctx.arc(0,0,3.92,0.574186831156177,1.496399584361004,0);
    ctx.translate(-20.29863372265538,-12.570843352789973);
    ctx.translate(20.881366277344615,12.570843352789973);
    ctx.arc(0,0,3.92,1.6451930692287888,2.567405822433616,0);
    ctx.translate(-20.881366277344615,-12.570843352789973);
    ctx.bezierCurveTo(16.77,13.450,16.71,10.83,16.35,9.13);
    ctx.bezierCurveTo(15.75,6.280,14.81,3.760,11.48,2.710);
    ctx.bezierCurveTo(9.8,2.180,9.31,2.710,8.18,3.760);
    ctx.translate(13.607125713820814,8.521796560793511);
    ctx.arc(0,0,7.22,-2.4214011817254257,-3.2370566231714304,1);
    ctx.translate(-13.607125713820814,-8.521796560793511);
    ctx.translate(37.68933050669907,6.576870747035298);
    ctx.arc(0,0,31.38,3.0575828036406114,2.754594674247834,1);
    ctx.translate(-37.68933050669907,-6.576870747035298);
    ctx.bezierCurveTo(9.76,21.17,6.75,21.47,5.17,23);
    ctx.bezierCurveTo(-1.360,29.41,5.39,35.24,11.63,37.13);
    ctx.translate(23.52809163044388,-6.6935497826632115);
    ctx.arc(0,0,45.41,1.8359056673819618,1.6359843410370856,1);
    ctx.translate(-23.52809163044388,6.6935497826632115);
    ctx.translate(17.692737192477445,-6.287920890823344);
    ctx.arc(0,0,45,1.5068135067377821,1.3048441765087355,1);
    ctx.translate(-17.692737192477445,6.287920890823344);
    ctx.bezierCurveTo(35.76,35.27,42.51,29.44,36,23);
    ctx.closePath();
  },
  rocket: ctx => {
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.moveTo(37,28.37);
    ctx.bezierCurveTo(36.23,27.77,35.14,26.94,34.1,26.29);
    ctx.bezierCurveTo(32.89,25.4,33.35,24.29,33.47,23.08);
    ctx.bezierCurveTo(33.75,20.91,33.75,21.27,33.93,19.56);
    ctx.bezierCurveTo(34.28,16.24,32.62,12.36,30.27,9.67);
    ctx.translate(2.288075667046254,35.380151898128716);
    ctx.arc(0,0,38,-0.7431122548960117,-0.933467669630325,1);
    ctx.translate(-2.288075667046254,-35.380151898128716);
    ctx.bezierCurveTo(23,3.35,21.78,2.57,20.61,2.5);
    ctx.lineTo(20.54,2.5);
    ctx.bezierCurveTo(19.37,2.57,18.14,3.34,16.25,4.84);
    ctx.translate(38.864457386044265,35.378276263318924);
    ctx.arc(0,0,38,-2.208207928238334,-2.398190016618187,1);
    ctx.translate(-38.864457386044265,-35.378276263318924);
    ctx.bezierCurveTo(8.540,12.35,6.890,16.24,7.23,19.55);
    ctx.bezierCurveTo(7.41,21.26,7.41,20.91,7.69,23.07);
    ctx.bezierCurveTo(7.810,24.28,8.27,25.39,7.060,26.28);
    ctx.bezierCurveTo(6.060,26.93,4.930,27.77,4.16,28.36);
    ctx.bezierCurveTo(2.59,29.43,2,30.26,3,31.92);
    ctx.translate(27.68923536262242,17.7632610672855);
    ctx.arc(0,0,28.46,2.62096373937888,2.367437288320849,1);
    ctx.translate(-27.68923536262242,-17.7632610672855);
    ctx.bezierCurveTo(8.66,38.85,9.34,39.16,11.29,37.44);
    ctx.bezierCurveTo(12.29,36.54,12.94,35.80,14.35,34.44);
    ctx.bezierCurveTo(16.76,32.10,17.3,32.16,18.35,32.10);
    ctx.lineTo(22.83,32.10);
    ctx.bezierCurveTo(23.83,32.16,24.39,32.10,26.83,34.44);
    ctx.bezierCurveTo(28.24,35.81,28.83,36.54,29.89,37.44);
    ctx.bezierCurveTo(31.89,39.16,32.52,38.864,33.84,37.66);
    ctx.translate(13.498805773159297,17.769340950437513);
    ctx.arc(0,0,28.45,0.7742001620930818,0.5205841173867767,1);
    ctx.translate(-13.498805773159297,-17.769340950437513);
    ctx.bezierCurveTo(39.16,30.26,38.55,29.43,37,28.37);
    ctx.closePath();
  },
  tree: ctx => {
    ctx.lineJoin = "miter";
    ctx.miterLimit = 10;
    ctx.moveTo(22.86,38.64);
    ctx.bezierCurveTo(20.86,38.59,23.19,38.64,22.86,38.64);
    ctx.translate(23.384649569127795,11.805128231541445);
    ctx.arc(0,0,26.84,1.5903448732197945,1.816350844963346,0);
    ctx.translate(-23.384649569127795,-11.805128231541445);
    ctx.bezierCurveTo(16.22,37.68,16.07,37.36,16.25,36.76);
    ctx.translate(6.055401858215319,33.7488426265769);
    ctx.arc(0,0,10.63,0.28720179207691954,-0.031881470829443814,1);
    ctx.translate(-6.055401858215319,-33.7488426265769);
    ctx.translate(-25.074097862159867,31.678119023380507);
    ctx.arc(0,0,41.79,0.04145434565484857,-0.06412911105660304,1);
    ctx.translate(25.074097862159867,-31.678119023380507);
    ctx.bezierCurveTo(15.71,24,12.92,26.35,10.73,27.3);
    ctx.bezierCurveTo(6.73,29.04,4.91,27.45,3.736,25.3);
    ctx.bezierCurveTo(2.636,23.3,1.865,21.44,3.486,18.64);
    ctx.translate(10.813211017748216,22.85962112118333);
    ctx.arc(0,0,8.53,-2.624125970769298,-2.114577280560904,0);
    ctx.translate(-10.813211017748216,-22.85962112118333);
    ctx.bezierCurveTo(6.7,15.15,4.59,14,6,10.2);
    ctx.bezierCurveTo(6.8,8.09,7.88,7.29,10.370,6.45);
    ctx.bezierCurveTo(11.01,6.26,12.48,6.13,13.15,6.01);
    ctx.translate(11.723055367504319,1.3851292973974103);
    ctx.arc(0,0,4.84,1.2715257628988468,0.5536550283486749,1);
    ctx.translate(-11.723055367504319,-1.3851292973974103);
    ctx.bezierCurveTo(18.62,0.47,25.6,4,27.35,6.75);
    ctx.translate(30.197696134696365,5.00465570031716);
    ctx.arc(0,0,3.34,2.5917440268133047,1.2754105487834428,1);
    ctx.translate(-30.197696134696365,-5.00465570031716);
    ctx.translate(31.63875807060662,12.414008290362176);
    ctx.arc(0,0,4.24,-1.6815789384116107,-1.002699538081367,0);
    ctx.translate(-31.63875807060662,-12.414008290362176);
    ctx.translate(31.91967775196261,13.203337129309016);
    ctx.arc(0,0,4.8,-1.1409470431674589,-0.7002975470755024,0);
    ctx.translate(-31.91967775196261,-13.203337129309016);
    ctx.translate(32.216027997921465,13.800028852080985);
    ctx.arc(0,0,5,-0.830110248130747,-0.08009136900564195,0);
    ctx.translate(-32.216027997921465,-13.800028852080985);
    ctx.translate(32.8472242160018,14.325117816409788);
    ctx.arc(0,0,4.45,-0.20941901574845637,0.4673648753768477,0);
    ctx.translate(-32.8472242160018,-14.325117816409788);
    ctx.bezierCurveTo(36.71,16.59,36.21,17.25,36.33,17.55);
    ctx.bezierCurveTo(36.45,17.85,37.26,18.21,37.48,18.47);
    ctx.bezierCurveTo(40.29,21.12,37.48,27.57,34.03,27.57);
    ctx.bezierCurveTo(31.36,27.57,24.28,21.8,25.71,28.42);
    ctx.bezierCurveTo(26.17,30.56,27.48,33.37,28.13,35.6);
    ctx.bezierCurveTo(28.85,38,24.11,38.64,22.86,38.64);
    ctx.closePath();
  }
}



function pathAction(actionFunction) {
  
  return function(ctx, name, size=20) {
    
    let pathFunction = paths[name];
    
    if (!pathFunction) {
      throw "Unknown Shape: " + name;
    }
    
    let scale = size / 41.14;
    
    ctx.save();
    
    ctx.lineWidth = 5;
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
  shapeNames: shapeNames,
  stroke: stroke,
  fill: fill,
  strokeVanishing: strokeVanishingAction,
  strokeVanishingWBW: strokeVanishingWBW,
  strokeVanishingBWB: strokeVanishingBWB,
  pathAction: pathAction
}