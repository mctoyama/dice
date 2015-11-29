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
local libraryMod = require("library")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local DeleteImageAPI = {}

----------------------------------------------------------------------------------
function DeleteImageAPI.post()

   local session = sessionMod:new()

   ngx.req.read_body()

   local args, err = ngx.req.get_post_args()

   if(session:get("loggedin") == "true") then

      if( args["ownerId"] == nil or args["contentsha1"] == nil ) then

         ngx.say(cjson.encode{ok=false,err="Delete image - wrong parameters!"})
         ngx.exit(ngx.HTTP_OK)
         return
      end
      -- deleting file
      libraryMod.deleteFile(session:get("accountId"),args["ownerId"],args["contentsha1"])

      -- return json
      ngx.say(cjson.encode{ok=true,id=args["id"]})
      ngx.exit(ngx.HTTP_OK)

   else
      -- not logged in!
      ngx.say(cjson.encode{ok=false,err="You must login first!"})
      ngx.exit(ngx.HTTP_OK)
      return
   end

end

----------------------------------------------------------------------------------

return DeleteImageAPI

----------------------------------------------------------------------------------
