const Hashids = require("hashids/cjs");

const hashids = new Hashids();

const cookieName = "stimsrv-clientid";

function factory(roles) {
  
  function clientRoleMiddleware(req, res, next) {
  
    let clientId = req.cookies[cookieName];
    if (!clientId) {
      // shorten the timestamp a bit for shorter auto-generated ids
      clientId = hashids.encode(Date.now()-(new Date("2021-01-01").getTime()));
      setClientIdCookie(res, clientId);
    }
    
    req.clientId = clientId;
    
    let candidates = roles.filter(r => r.device == clientId && r.role == req.query.role);
    
    if (candidates.length == 1) {
      req.clientRole = candidates[0].role;
    }
    else {
      req.clientRole = req.query.clientRole;
    }
    
    next();
  }

  
  return clientRoleMiddleware;
}

factory.setClientIdCookie = function(res, clientId) {
  res.cookie(cookieName, clientId, {expires: new Date("2038-01-01T00:00:00")})
}


module.exports = factory;