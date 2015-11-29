----------------------------------------------------------------------------------
-- Copyright 2015 Marcelo Costa Toyama
--
-- This file is part of PixelnDice.
--
--    PixelnDice is free software: you can redistribute it and/or modify
--    it under the terms of the GNU Affero General Public License as published by
--    the Free Software Foundation, either version 3 of the License, or
--    any later version.
--
--    PixelnDice is distributed in the hope that it will be useful,
--    but WITHOUT ANY WARRANTY; without even the implied warranty of
--    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
--    GNU Affero General Public License for more details.
--
--    You should have received a copy of the GNU Affero General Public License
--    along with PixelnDice.  If not, see <http://www.gnu.org/licenses/>.
--
----------------------------------------------------------------------------------

require "resty.core"

local sessionMod = require("session")
local account = require("account")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local CreateAccountAPI = {}

----------------------------------------------------------------------------------
function CreateAccountAPI.post()

   local session = sessionMod:new()

   ngx.req.read_body()

   local args, err = ngx.req.get_post_args()

   if( args["password"] ~= args["confirmPassword"] ) then

      ngx.say( cjson.encode({ok=false, err="Password mismatch"}) )

   else

      if( args["cn"] == nil ) then
         ngx.say( cjson.encode({ok=false, err="Invalid name"}) )
      elseif( args["sn"] == nil ) then
         ngx.say( cjson.encode({ok=false, err="Invalid last name"}) )
      elseif( args["email"] == nil) then
         ngx.say( cjson.encode({ok=false, err="Invalid email"}) )
      else

         local email = string.lower(args["email"])

         ok, err, accountId = account.create(args["token"],args["cn"],args["sn"],email, args["password"], ngx.var.remote_addr,account.defaultQuota())

         if( ok ) then

            session:set("loggedin","true")
            session:set("email", email)
            session:set("name", args["cn"].." "..args["sn"])
            session:set("accountId",accountId)
            session:set("token",account.getToken(accountId))

            ngx.say( cjson.encode({ok=true}) )
         else
            ngx.say( cjson.encode({ok=false, err= err}) )
         end
      end
   end

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return CreateAccountAPI

----------------------------------------------------------------------------------
