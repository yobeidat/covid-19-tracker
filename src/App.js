import React, { useState, useEffect } from 'react';
import './App.css';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import {sortData, prettyPrintStat} from './utils';
import "leaflet/dist/leaflet.css";
import { WebMapView } from './WebMapView';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lng: -40.4796,lat: 34.80746 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));
          const sortedData = sortData(data);
          setCountries(countries);
          setTableData(sortedData);
          setMapCountries(data);
        });
    }
    getCountriesData();
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      });
  }, []);
  const onCountrChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        /*setMapCenter([data.countryInfo.long,data.countryInfo.lat]);
        setMapZoom(4);*/
      });
  };
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountrChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => {
                  return <MenuItem key={country.value} value={country.value}>{country.name}</MenuItem>
                })
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox 
          active={casesType === "cases"}
          onClick={(e)=>setCasesType("cases")}
          title="Corona Cases" 
          isRed
          cases={prettyPrintStat(countryInfo.todayCases)} 
          total={countryInfo.cases}></InfoBox>
          <InfoBox 
          active={casesType === "recovered"}
          onClick={(e)=>setCasesType("recovered")}
          title="Recovered" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={countryInfo.recovered}></InfoBox>
          <InfoBox 
          active={casesType === "deaths"}
          onClick={(e)=>setCasesType("deaths")}
          title="Deaths" 
          isRed
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={countryInfo.deaths}></InfoBox>
        </div>
        {/* <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        /> */}
        <WebMapView countryCode={country} countryInfo={countryInfo}/>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle"> Worldwide New {casesType}</h3>
          <LineGraph casesType={casesType}/> 
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
