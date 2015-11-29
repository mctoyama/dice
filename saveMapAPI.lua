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
local mapMod = require("map")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local SaveMapAPI = {}

----------------------------------------------------------------------------------
function SaveMapAPI.post()

   local session = sessionMod:new()

   ngx.req.read_body()

   local args, err = ngx.req.get_post_args()

   local ret = mapMod.save(session:get("accountId"),session:get("campaignId"),args["mapId"],args["json"])

   if( not ret ) then
      ngx.say(cjson.encode({ok=false,err="MapId: "..args["mapId"].." not found."}))
   else
      ngx.say(cjson.encode({ok=true}))
   end

   ngx.exit(ngx.HTTP_OK)
end

----------------------------------------------------------------------------------

return SaveMapAPI

----------------------------------------------------------------------------------
