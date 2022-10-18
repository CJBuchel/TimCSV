import { Component } from "react";

import { CSVDownload, CSVLink } from "react-csv";

import "../../assets/MainPage.css";
import "../../assets/Buttons.css";
import "../../assets/ColourScheme.css";

interface IProps {}

interface IState {
  loading_data:boolean;
  season:number;
  csv_data:string[][];
}

const cloud_api_location:string = "https://firstaustralia.systems/api";

export default class MainPage extends Component<IProps, IState> {
  constructor(props:any) {
    super(props);

    this.state = {
      loading_data:false,
      season:0,
      csv_data:[]
    }

    this.getCSV = this.getCSV.bind(this);
  }

  async FETCH_GENERIC_GET(request:any, noAlert:boolean = false): Promise<Response> {
    const res:Promise<Response> = await fetch(request).then((response) => {
      // Return the response in json format
      return response.json();
    }).then((data:any) => {
      // If message from request server
      if (data.message && !noAlert) {
        alert(data.message);
      }
      return data;
    }).catch((error:any) => {
      // Error while trying to post to server
      console.log("Error While Fetching");
      console.log(error);
      throw error;
    });
  
    return res;
  }

  async getTeams(tournaments:any[]) {
    // console.log(tournaments[0]._id);
    const csv:string[][] = [];
    csv.push(["Team Number", "Team Name", "Event Name", "Start Date"]);
    for (const tournament of tournaments) {
      await this.FETCH_GENERIC_GET(`${cloud_api_location}/team/tournament/${tournament._id}`).then((teams:any) => {
        for (const team of teams) {
          csv.push([`AU-${team.team_number}C`, `${team.team_name}`, `${tournament.name}`, `${tournament.start}`]);
        }
      });
    }

    console.log(csv);
    this.setState({csv_data: csv})
    this.setState({loading_data: false});
  }

  async getCSV() {
    this.setState({loading_data: true});
    await this.FETCH_GENERIC_GET(`${cloud_api_location}/tournaments`).then((res) => {
      const all_tourns:any = res;
      const my_tourns = all_tourns.filter((e:any) => e.season == this.state.season).filter((e:any) => e.program === "FLL_CHALLENGE").filter((e:any) => e.state === "WA");
      console.log(my_tourns);
      this.getTeams(my_tourns);
    });
  }

  setYear(value:string) {
    var season:number = Number(value+(Number(value)+1));
    this.setState({season: season});
    // console.log(season);
  }

  downloadCSV() {
    // const downloader = <CSVDownload data={this.state.csv_data}/>
    if (this.state.csv_data.length > 1 && !this.state.loading_data) {
      return (
        <div className="csv-link">
          <CSVLink style={{color: 'white'}} data={this.state.csv_data}>Download CSV</CSVLink>
        </div>
      )
    } else if (this.state.loading_data) {
      return <p>Loading from server might take a while brrrr...</p>
    } else {
      return <></>
    }
  }

  render() {
    return (
      <div>
        <div className="main-page">
          <label>Input year: -</label>
          <input placeholder="input year, e.g 2022" type={"number"} onChange={(e) => this.setYear(e.target.value)}/>
        </div>
        <div className="main-page">
          {/* <input>Year</input> */}
          <h1>Get yourself a "MEGA" CSV - </h1>
          <div>
            <button onClick={this.getCSV} className="hoverButton back-blue">Mega CSV</button>
          </div>
          {this.downloadCSV()}
        </div>
      </div>
    );
  }
}