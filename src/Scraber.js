import React from "react";

const months = [
  "Januar",
  "Februar",
  "Marts",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "December",
];

const types = [
  "precip",
  "pressure",
  "humidity",
  "sunhours",
  "lightning",
  "temperature",
  "wind",
  "winddir",
];

class Scraber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: true,
      loadingYear: "",
      loadingMonth: "",
      final: [],
      selectedDate: "",
      selectedValue: 99,
    };
  }

  start() {
    this.setState({
      isLoaded: false,
      final: []
    });

    var minDate = new Date("2012/01/01");
    var startDate = new Date(this.state.selectedDate);
    var now = new Date();
    if (
      minDate.valueOf() > startDate.valueOf() ||
      startDate.valueOf() > now.valueOf()
    ) {
      this.setState({
        error: "Date needs to before 1th Jan 2012 or after today",
        isLoaded: true,
      });
    } else if (this.state.selectedValue === 99) {
      this.setState({
        error: "Please select value",
        isLoaded: true,
      });
    } else {
      this.getData(startDate);
    }
  }
  getData(tmp) {
    var date = new Date(tmp);
    var now = new Date();
    if (date.getFullYear() !== this.state.loadingYear) {
      this.setState({
        loadingYear: date.getFullYear(),
      });
    }
    if (date.getMonth() !== this.state.loadingMonth) {
      this.setState({ loadingMonth: date.getMonth() });
    }
    if (date.valueOf() < now.valueOf()) {
      var endpoint =
        "https://www.dmi.dk/dmidk_obsWS/rest/archive/hourly/danmark/" +
        types[this.state.selectedValue] +
        "/Hele%20landet/" +
        date.getFullYear() +
        "/" +
        months[date.getMonth()] +
        "/" +
        date.getDate();
      fetch(endpoint)
        .then((res) => res.json())
        .then((res) => {
          var data;
          if (this.state.selectedValue === '5'|| this.state.selectedValue === '6') {
            data = res[0].dataserie
          }else{
            
            data = res.dataserie 
          }
          var joined = this.state.final.concat(data);
          this.setState({ final: joined });
          var nextDay = new Date(+date);
          var dateValue = nextDay.getDate() + 1;
          nextDay.setDate(dateValue);
          this.getData(nextDay);
        });
    } else {
      this.setState({
        isLoaded: true,
      });
      console.log(this.state.final);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <p>Error: {this.state.error}</p>
          <button onClick={() => this.setState({ error: "" })}>Restart</button>
        </div>
      );
    } else if (!this.state.isLoaded) {
      return (
        <div>
          <h1>LOADING</h1>
          <p>Current month loading: {months[this.state.loadingMonth]}</p>
          <p>Current year loading: {this.state.loadingYear}</p>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ padding: 10 }}>
            <h1>Load DMI data</h1>
            <p><i>*You need to modify CORS. <a href="https://www.moesif.com/?int_source=corsextension">I use this exstention</a></i>
            </p>
            <p>
              The historical <a href="http://dmi.dk/">DMI</a> weather data will
              be displayed in a JSON format
            </p>
            <p>
              Select start date (after 01/01/2012) :{" "}
              <input
                onChange={(e) =>
                  this.setState({ selectedDate: e.target.value })
                }
                type="date"
              />
            </p>
            <p>
              Select what value types:
              <select
                name="types"
                onChange={(e) =>
                  this.setState({ selectedValue: e.target.value })
                }
              >
                <option value={99}>Select value type</option>
                <option value={0}>{types[0]}</option>
                <option value={1}>{types[1]}</option>
                <option value={2}>{types[2]}</option>
                <option value={3}>{types[3]}</option>
                <option value={4}>{types[4]}</option>
                <option value={5}>{types[5]}</option>
                <option value={6}>{types[6]}</option>
                <option value={7}>{types[7]}</option>
              </select>
            </p>
            <button onClick={() => this.start()}>Load data</button>
          </div>
          <code>[</code>
          {this.state.final.map((val, index) => {
            return (
              <code key={index}>
                {"{"}"value" : {val.value}, "hour" : "{val.hourLocalString}:00",
                "date" : "{val.dayLocalString}", "month" : "
                {val.monthLocalString}", "year" : {val.yearLocalString} {"}"},
              </code>
            );
          })}
          <code>]</code>
        </div>
      );
    }
  }
}
export default Scraber;
