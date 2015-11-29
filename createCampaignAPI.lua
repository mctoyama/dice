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
local campaignMod = require("campaign")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local CreateCampaignAPI = {}

----------------------------------------------------------------------------------
function CreateCampaignAPI.post()

   local session = sessionMod:new()

   ngx.req.read_body()

   local args, err = ngx.req.get_post_args()

   local campaignId = campaignMod.create(session:get("accountId"),args["name"])

   ngx.say(cjson.encode{ok=true,accountId=session:get("accountId"),campaignId=campaignId})

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return CreateCampaignAPI

----------------------------------------------------------------------------------
