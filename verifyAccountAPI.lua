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
local daemonAPI = require("daemonAPI")
local template = require("template")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local VerifyAccountAPI = {}

----------------------------------------------------------------------------------
function VerifyAccountAPI.post()

   local session = sessionMod:new()

   ngx.req.read_body()

   local args, err = ngx.req.get_post_args()

   if( args["email"] == nil) then
      ngx.say( cjson.encode({ok=false, err="Invalid email"}) )
   else

      local ok, err, token = account.verifyEmail(string.lower(args["email"]))

      if( ok ) then

         local opts = {}
         opts.email = string.lower(args["email"])
         opts.link = "https://"..ngx.var.host.."/account/create?token="..token

         daemonAPI.sendEmail(string.lower(args["email"]),
                             "Pixelndice.org account creation!",
                             template.render("verify-email-account-creation.mustache", opts)
         )

         ngx.say( cjson.encode({ok=true}) )
      else
         ngx.say( cjson.encode({ok=false, err= err}) )
      end
   end

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return VerifyAccountAPI

----------------------------------------------------------------------------------
