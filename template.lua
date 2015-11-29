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

local io = require("io")

local lustache = require("lustache")

-------------------------------------------------------------------------------

local TemplateMod = {}

-------------------------------------------------------------------------------
-- Creates a new Account

function TemplateMod.render(filename, opts)

   local fd = io.open("./html/mustache-pages/" .. filename)
   local text = fd:read("*all")
   fd:close()

   return( lustache:render(text,opts) )
end

-------------------------------------------------------------------------------

return TemplateMod

-------------------------------------------------------------------------------
