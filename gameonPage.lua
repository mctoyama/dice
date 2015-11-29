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
local mapMod = require("map")
local roomMod = require("room")
local campaignMod = require("campaign")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local GameonPage = {}

----------------------------------------------------------------------------------
function GameonPage.get()

   local session = sessionMod:new()

   local args = ngx.req.get_uri_args()

   if( not (args.gmId and args.campaignId) ) then
      ngx.say("INVALID URL")
      ngx.exit(ngx.HTTP_OK)
   else

      opts = {}

      opts.loggedin = session:get("loggedin") == "true"

      opts.gmId = args.gmId

      if( opts.loggedin ) then
         opts.accountId = session:get("accountId")
         opts.email = session:get("email")
      else
         opts.redirecturl = ngx.escape_uri("?"..ngx.encode_args({gmId=args.gmId, campaignId=args.campaignId}))
         ngx.say( template.render("login.mustache", opts ) )
         ngx.exit(ngx.HTTP_OK)
      end

      if( not campaignMod.exists(args.gmId,args.campaignId) ) then
         local tmp = {}
         tmp.header = "Campaign Not found!"
         tmp.msg = "There is no campaign registered in this link!"
         ngx.say( template.render("error.mustache", tmp ) )
         ngx.exit(ngx.HTTP_OK)
      else
         session:set("campaignId",args.campaignId)
         opts.campaignId = args.campaignId
         opts.token = session:get("token")

         opts.roomId = campaignMod.roomId(opts.gmId,opts.campaignId)

         campaignMod.addPlayer(opts.gmId,opts.campaignId,opts.accountId)

         ngx.say( template.render("app.mustache", opts ) )
         ngx.exit(ngx.HTTP_OK)
      end

   end

end

----------------------------------------------------------------------------------

return GameonPage

----------------------------------------------------------------------------------
