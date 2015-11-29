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

local redis = require("resty.redis")

local sessionMod = require("session")
local template = require("template")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

local lustache = require("lustache")

local indexPage = require("indexPage")

----------------------------------------------------------------------------------

local VerifyAccountPage = {}

----------------------------------------------------------------------------------
function VerifyAccountPage.get()

   local session = sessionMod:new()

   local opts = {loggedin=false, msg="", name=session:get("name")}

   if(session:get("loggedin") == "true") then
      opts.loggedin = true
      opts.msg = "You are already logged in!"
      opts.header = lustache:render("Welcome! - {{username}}",{username=session:get("name")})
      ngx.say( template.render("error.mustache", opts) )
   else
      ngx.say( template.render("verify-email.mustache", opts ) )
   end

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return VerifyAccountPage

----------------------------------------------------------------------------------
