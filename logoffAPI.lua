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

local LogoffAPI = {}

----------------------------------------------------------------------------------
function LogoffAPI.post()

   local session = sessionMod:new()

   if( session:get("loggedin") == "true" ) then
      ok, err = account.logoff(session:get("accountId"))

      if( ok ) then

         session:set("loggedin","false")
         session:set("email", "")
         session:set("name", "")
         session:set("accountId","")

         ngx.say( cjson.encode({ok=true}) )
      else
         ngx.say( cjson.encode({ok=false, err= err}) )
      end

   else
      ngx.say( cjson.encode({ok=false, err="You are not loggedin!"}) )
   end

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return LogoffAPI

----------------------------------------------------------------------------------
