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

local uuid = require("uuid")
local sessionMod = require("session")
local template = require("template")
local campaignMod = require("campaign")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

local lustache = require("lustache")

----------------------------------------------------------------------------------

local IndexPage = {}

----------------------------------------------------------------------------------
function IndexPage.get()

   local session = sessionMod:new()

   local opts = {}

   if(session:get("loggedin") == "true") then

      opts.loginBlock = lustache:render("Hi {{name}} - <button id='logoffbtn' type='button' class='btn btn-default'>Logoff</button>", {name=session:get("name")})

      opts.campaignList = {}

      local campaignArrayRet = campaignMod.list(session:get("accountId"))

      for i, res in pairs(campaignArrayRet) do
         table.insert(opts.campaignList, {name=res.name,
                                          campaignId=res.campaignId,
                                          openlink="/gameon/?gmId="..ngx.escape_uri(session:get("accountId")).."&campaignId="..ngx.escape_uri(res.campaignId)})
      end
      opts.settingsDivClass = ""

      opts.aboutDivClass = "class=\"hidden\""
      opts.campaignDivClass = ""

   else
      opts.loginBlock = lustache:render("Welcome! - <a class='btn btn-default' href='/login'> Login / Create </a>", {})

      opts.campaignList = {}

      opts.aboutDivClass = ""
      opts.campaignDivClass = "class=\"hidden\""
      opts.settingsDivClass = "class='hidden'"
   end

   ngx.say( template.render("index.mustache", opts ) )

   ngx.exit(ngx.HTTP_OK)

end

-------------------------------------------------------------------------------

return IndexPage

-------------------------------------------------------------------------------
