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

local upload = require("resty.upload")

local sessionMod = require("session")
local libraryMod = require("library")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

----------------------------------------------------------------------------------

local UploadImageAPI = {}

----------------------------------------------------------------------------------
function UploadImageAPI.post()

   local fileForm

   local errorFlag = false

   local filename = ""
   local tags = ""
   local public = 0

   -- 0 none content
   -- 1 form --> file
   -- 2 form --> tags
   -- 3 form --> public
   local contentNil = 0
   local contentFile = 1
   local contentTags = 2
   local contentPublic = 3
   local contentPart = contentNil

   local session = sessionMod:new()

   if(session:get("loggedin") == "true") then

      -- should be set to 4096 or 8192 for real-world settings
      local chunk_size = 8192

      local form = upload:new(chunk_size)

      local file

      --local my_get_filename,my_save_uploadfile_todb

      form:set_timeout(0) -- 1 sec

      local countFile=0

      local fieldTAGS = 0
      local fieldFile = 1
      local field = -1

      while true do
         local typ, res, err = form:read()
         if not typ then
            ngx.say(cjson.encode{ok=false,err="Failed to read: "..err})
            errorFlag = true
            break
         end
         if typ == "header" then
            if res[1] ~= "Content-Type" then
               fileForm = res[2]

               if( fileForm:find("filename") ) then

                  contentPart = contentFile

                  filename = fileForm:match("filename=\"(.+)\"")
                  countFile=countFile+1
                  filepath = os.tmpname()

                  file = io.open(filepath,"w+")

                  if not file then
                     ngx.say(cjson.encode{ok=false,err="Failed to open file ",file=filename})
                     errorFlag = true
                     break
                  end

               elseif( fileForm:find("tags") ) then
                  contentPart = contentTags
               elseif( fileForm:find("public") ) then
                  contentPart = contentPublic
               else
               end
            end
         elseif typ == "body" then
            if contentPart == contentFile and file then
               file:write(res)
            elseif contentPart == contentTags then
               tags = tags..res
            elseif contentPart == contentPublic then
               public = tonumber(res)
            end
         elseif typ == "part_end" then
            if contentPart == contentFile and file then
               file:close()
               file = nil
            elseif contentPart == contentTags then
            elseif contentPart == contentPublic then
            end

            contentPart = contentNil

         elseif typ == "eof" then
            break
         else
         end
      end

      if countFile==0 then
         errorFlag = true
         ngx.say(cjson.encode{ok=false,err="Please upload at least one file!"})
      end

   else
      -- not logged in!
      ngx.say(cjson.encode{ok=false,err="You must login first!"})
      errorFlag = true
   end

   if( not errorFlag ) then

      local flag, msg = libraryMod.SaveUploadFileToLibrary(session:get("accountId"),filename,filepath,tags)

      if( not flag ) then
         ngx.say(cjson.encode{ok=false,err=msg,file=filename})
      else
         ngx.say(cjson.encode{ok=true,file=filename})
      end

   end

   ngx.exit(ngx.HTTP_OK)

end

----------------------------------------------------------------------------------

return UploadImageAPI

----------------------------------------------------------------------------------
