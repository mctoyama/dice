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

local uuid = require("uuid")

local myRedisConn = require("myRedisConn")

local cjson = require("cjson")
local cjson2 = cjson.new()
local cjson_safe = require("cjson.safe")

local os = require("os")

----------------------------------------------------------------------------------
local SessionMod = {}

local DEFAULT_TTL = 259200
----------------------------------------------------------------------------------
-- Creates a new Session.
-- Gets header cookie and saves session on redis
function SessionMod:new()

   o = {}   -- create object if user does not provide one
   setmetatable(o, self)
   self.__index = self

   local header = ngx.req.get_headers()

   local vc

   if( header["cookie"] == nil ) then
      vc = ""
   else
      vc = header["cookie"]:match("SSID=([^=]+)")
   end

   if( vc ~= "" ) then
      o.myUUID = vc
   else
      o.myUUID = "SESSION:ID:"..uuid()
      ngx.header["Set-Cookie"] = {"SSID=" .. o.myUUID .. ";  Expires=".. os.date("%a, %d %b %Y %X GMT", os.time()+DEFAULT_TTL) .. "; Path=/; HttpOnly;"}
      ngx.send_headers()
   end

   return o

end

----------------------------------------------------------------------------------
-- Returns all session data
function SessionMod:data()

   local red = myRedisConn.connect()
   local ret = red:hgetall(o.myUUID)

   local data = {}

   for idx=1, table.getn(ret), 2 do
      data[ret[idx]] = ret[idx+1]
   end

   return( cjson.encode(data) )

end

----------------------------------------------------------------------------------
-- return specific key from session
function SessionMod:get(key)

   local red = myRedisConn.connect()

   local val, err = red:hget(o.myUUID, key)

   if( not val or val == ngx.null ) then
      return(nil)
   else
      return(val)
   end

end

----------------------------------------------------------------------------------
-- sets key from session
function SessionMod:set(key,value)

   local red = myRedisConn.connect()

   local ok, err = red:hset(o.myUUID, key, value)

   if( not ok ) then
      ngx.log(ngx.ERR, "Fail to save session: " .. self.myUUID)
   end

   local ok, err = red:expire(self.myUUID, DEFAULT_TTL)

end

----------------------------------------------------------------------------------
-- Returns sessin UUID
function SessionMod:uuid()

   return self.myUUID

end

----------------------------------------------------------------------------------
-- sets session TTL
function SessionMod:expire(ttl)

   local red = myRedisConn.connect()

   local ok, err = red:expire(self.myUUID, ttl)

   if not ok then
      ngx.log(ngx.ERR, "Failed to set TTL in redis uuid session: " .. err)
   end

end

----------------------------------------------------------------------------------
-- returns session ttl
function SessionMod:ttl()

   local red = myRedisConn.connect()

   local retTTL, err = red:ttl(self.myUUID)

   if not ok then
      ngx.log(ngx.ERR, "Failed to set TTL in redis uuid session: " .. err)
   end

   return retTTL

end

----------------------------------------------------------------------------------

return SessionMod

----------------------------------------------------------------------------------
