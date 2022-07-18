const sequence = 100.101;

export default {
  seq: sequence,
  label: 'insert NOAA rows into layer_mgt.layer table',
  sql: `
      INSERT INTO layer_mgt.layer (steward_id, layer_name, description, source_layer, source_location, 
                                   --cloudvault_location, mac_location, oracle_table, 
                                   schema_name, table_name)
      VALUES ((SELECT id FROM layer_mgt.layer_steward WHERE steward_name = 'NOAA'), 
              'AHPS river gauge forecast', 'Point data for river gauges in the country. The majority of the observed water level data displayed on the AHPS web pages originates from the United States Geological Survey''s (USGS) National Streamflow Information Program which maintains a national network of streamgauges. In addition, real-time water level information is collected from other federal, state, and local streamgauge networks. Each gauge has a status and a forecast.', 'XML, obtained via API call and loaded to DB w/ ogr2ogr', '[AHPS River Gauge Forecast (WFS)](https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Observations/ahps_riv_gauges/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=ahps_riv_gauges:Full_Forecast_Period_Stages&srsName=EPSG:4326&propertyname=state,waterbody,status,gaugelid,idp_filedate,url)', 
              --null, null, null, 
              'noaa', 'storm_ahps_current');

      INSERT INTO layer_mgt.layer (steward_id, layer_name, description, source_layer, source_location, 
                                   --cloudvault_location, mac_location, oracle_table, 
                                   schema_name, table_name)
      VALUES ((SELECT id FROM layer_mgt.layer_steward WHERE steward_name = 'NOAA'), 
              'Active Storm Outlook Forecast', 
              'All currently active tropical cyclones, and disturbances with tropical cyclone formation potential over the next five days. Details for each system are included;

Needed for [PI Goal #3](https://maestro.dhs.gov/confluence/display/PI/Geospatial+Application+PI+goals+and+questions): How much will/does an event cost?

', 'XML, obtained via API call and loaded to DB w/ ogr2ogr', 
              '[Active Storm Outlook Forecast (WFS)](https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Forecasts_Guidance_Warnings/NHC_tropical_weather_summary/MapServer/WFSServer?&service=WFS&request=getfeature&typename=NHC_tropical_weather_summary:Forecast_Points&srsName=EPSG:4326)', 
              --null, null, null, 
              'noaa', 'storm_outlook_current');

      INSERT INTO layer_mgt.layer (steward_id, layer_name, description, source_layer, source_location, 
                                   --cloudvault_location, mac_location, oracle_table, 
                                   schema_name, table_name)
      VALUES ((SELECT id FROM layer_mgt.layer_steward WHERE steward_name = 'NOAA'), 'NWS Significant river flood outlook', 
              'Large polygon areas showing potential flooding in three categories:

Occurring or Imminent - Significant flooding is already occurring or is forecast to occur during the outlook period.

Likely - Weather conditions indicate that significant flooding can be expected during the outlook period.

Possible - Weather conditions indicate that significant flooding could occur. Such flooding is neither certain nor imminent.

https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/sig_riv_fld_outlk/MapServer', 
              'XML, obtained via API call and loaded to DB w/ ogr2ogr', 
              '[NWS Significant River Flood Outlook (WFS)](https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Forecasts_Guidance_Warnings/sig_riv_fld_outlk/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=sig_riv_fld_outlk:Flood_Outlook&srsName=EPSG:4326)

[Alternative (JSON)](https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/sig_riv_fld_outlk/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson)',
              --null, null, null, 
              'noaa', 'storm_srfo_current');

      INSERT INTO layer_mgt.layer (steward_id, layer_name, description, source_layer, source_location, 
                                   --cloudvault_location, mac_location, oracle_table, 
                                   schema_name, table_name)
      VALUES ((SELECT id FROM layer_mgt.layer_steward WHERE steward_name = 'NOAA'), 'NWS Excessive Rainfall Outlook Days 1, 2, 3', 'Risk of 1 to 6 hour rainfall exceeding flash flood guidance at a point', 'XML, obtained via API call and loaded to DB w/ ogr2ogr', '[Day 1 (WFS)](https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=wpc_precip_hazards:Excessive_Rainfall_Day_1),
[Day 2 (WFS)](https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=wpc_precip_hazards:Excessive_Rainfall_Day_2),
[Day 3 (WFS)](https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Forecasts_Guidance_Warnings/wpc_precip_hazards/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeName=wpc_precip_hazards:Excessive_Rainfall_Day_3)', 
              --null, null, null, 
              'noaa', 'storm_ero_current');

      INSERT INTO layer_mgt.layer (steward_id, layer_name, description, source_layer, source_location, 
                                   --cloudvault_location, mac_location, oracle_table, 
                                   schema_name, table_name)
      VALUES ((SELECT id FROM layer_mgt.layer_steward WHERE steward_name = 'NOAA'), 'HURDAT2', 'Historic Hurricane track data, point data in pseudo-csv format with attributes of storm characteristics at each observation point.

Documentation:

https://www.nhc.noaa.gov/data/hurdat/hurdat2-format-nov2019.pdf

https://www.nhc.noaa.gov/data/hurdat/hurdat2-format-nencpac.pdf', 'Text file, but comma-delimited (Not a CSV)', 'https://www.nhc.noaa.gov/data/hurdat/hurdat2-1851-2020-052921.txt

https://www.nhc.noaa.gov/data/hurdat/hurdat2-nepac-1949-2020-043021a.txt', 
              --null, null, null, 
              'noaa', 'hurdat2');
  `
};
