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
----------------------------------------------------------------------------------

local GetImageAPI = {}

----------------------------------------------------------------------------------
function GetImageAPI.get()

   local session = sessionMod:new()

   local args, err = ngx.req.get_uri_args()

   if(session:get("loggedin") == "true") then

      -- retriving file path for image file
      local fileReg = libraryMod.getFileRegistry(args["gmId"],args["ownerId"],args["contentsha1"])

      if( fileReg ) then

         local ok, filetype, extension = libraryMod.fileType(fileReg.filename)

         local mime = filetype.."/"..extension

         ngx.header["Content-Type"] = mime

         -- serving file
         local email = ""

         local file = io.open(fileReg.filepath,"rb")

         local tmp = ""

         while( true ) do
            tmp = file:read(2^13) -- 8kb
            if( tmp == nil or tmp == "" ) then break end
            ngx.print(tmp)
         end

         file:close()

      else
         ngx.exit(ngx.HTTP_UNAUTHORIZE)
      end

   else
      -- not logged in!
      ngx.exit(ngx.HTTP_UNAUTHORIZE)
   end

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return GetImageAPI

----------------------------------------------------------------------------------
