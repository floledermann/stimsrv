const Hashids = require("hashids/cjs");

const hashids = new Hashids();

const clientIdCookieName = "stimsrv-clientid";

function factory(roles, devices) {
  
  let devicesById = {};

  devices.forEach( d => {
    if (d.id) devicesById[d.id] = d
  });
  
  function clientRoleMiddleware(req, res, next) {
  
    let clientId = req.cookies[clientIdCookieName];
    let ip = req.socket.remoteAddress;
    
    if (!clientId) {

      // find id by ip  
      function matchDevice(req, device) {
        // IP trumps clientID setting
        if (device.ip) {
          if (device.ip == ".") {
            //console.log(req.socket.address().address);
            return (req.socket.remoteAddress == req.socket.address().address);
          }
          return (req.socket.remoteAddress.endsWith(device.ip));
        }
        return false;
      }      
      
      clientId = devices.find(d => matchDevice(req, d))?.id;
 
      if (!clientId) {
        // still not found -> autogenerate id
        // shorten the timestamp a bit for shorter auto-generated ids
        clientId = hashids.encode(Date.now()-(new Date("2021-01-01").getTime()));
      }
      factory.setClientIdCookie(res, clientId);
    }
    
    req.clientId = clientId;
    
    let potentialRoles = roles.filter(r => r.device == clientId);
    let activeRole = null;
    
    if (req.query.role) {
      activeRole = potentialRoles.find(r => r.role == req.query.role);
      req.clientRole = activeRole;
    }
    if (!activeRole) {
      activeRole = potentialRoles[0];
    }
       
    console.log(req.clientRole);
        
    // on new experiment, always show role selection screen
    if (req.method == "GET" && (!req.clientRole || req.session.experimentTimestamp != req.app.locals.experimentTimestamp)) {
      
      req.session.experimentTimestamp = req.app.locals.experimentTimestamp;
      
      res.render("select_role.html", {
        experiment: req.app.locals.experiment,
        ip: ip,
        clientid: req.clientId,
        potentialRoles: potentialRoles,
        activeRole: activeRole,
        device: devicesById[clientId]
      });
      
      return;
    }
    
    next();
  }

  
  return clientRoleMiddleware;
}

factory.setClientIdCookie = function(res, clientId) {
  res.cookie(clientIdCookieName, clientId, {expires: new Date("2038-01-01T00:00:00")})
}


module.exports = factory;