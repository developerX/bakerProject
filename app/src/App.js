/**
 * Experience: I wouldn't normally put everything in 1 file but I was run & gun coding and this is what I came up with.
 *
 * I know there are many places where we can create reusable components, this is my first attempt.
 */

import React, { Component } from 'react';
import Moment from 'react-moment';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
// brought in bootstrap to add styles
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  //initial state
  state = {
    hasPhone: null,
    checkins: 0,
    firstName: '',
    lastName: '',
    email: '',
    points: 0,
    phone: '',
    newUser: true,
    updated: null,
    created: null
  }

  //handle the text input fields both for phone and sign up form
  handleChange = (e) => {
    this.setState({
      [e.target.name] : e.target.value
    })
  }

  // renders the initial phone input component
  renderPhone = () => {
    return (
      <div className="form">
        <div className="form-group">
          <label className="control-label">
            Phone Number
          </label>
          <input
            type="number"
            className="form-control"
            name="phone"
            placeholder="enter your number to get to hidden secrets"
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <button
            className="btn btn-lg btn-primary"
            type="button"
            onClick={this.handlePhoneSubmit}
            >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // renders the signup form component
  renderSignUpform = () => {
    const { phone } = this.state;
    return (
      <div className="form">
        <div className="form-group">
          <label className="control-label">
            First Name:
          </label>
          <input
            type="text"
            className="form-control"
            name="firstName"
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label className="control-label">
            Last Name:
          </label>
          <input
            type="text"
            className="form-control"
            name="lastName"
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label className="control-label">
            Email:
          </label>
          <input
            type="text"
            className="form-control"
            name="email"
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label className="control-label">
            Phone:
          </label>
          <input
            type="number"
            className="form-control"
            name="phone"
            value={phone}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <button
            className="btn btn-lg"
            onClick={this.handleSignUp}
            type="button">
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  //handles calling the api and creating a user
  handleSignUp = () => {
    const { firstName, lastName, email, phone } = this.state;

    axios({
      method: 'POST',
      url: 'http://localhost:3030/users',
      params: {
        firstName,
        lastName,
        email,
        phone
      }
    })
    .then(response => {
      this.setState({
        ...response.data,
        hasPhone: true
      });
    })
  }

  //handles the initial phone number lookup
  handlePhoneSubmit = () => {
    const { hasPhone, phone } = this.state;
    // don't attempt the request if no number is supplied and less then 10
    if (!phone || phone.length < 10) {
      return;
    }

    axios.get(`http://localhost:3030/phone/${phone}`)
      .then(response => {
          // Happy ;p
          this.setState({...response.data, hasPhone: true });
      })
      .catch( (err) => {
        // Sad :(
        this.setState({hasPhone: false});
      });
  }

  // Renders the dashboard after your sign up or if your number exists
  // also allows you to check in from this screen
  renderDashboard = () => {
    const {
      firstName,
      lastName,
      updated,
      created,
      points,
      phone,
      checkins,
      email,
      newUser
    } = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-xs-12 col-sm-6">
            <div style={{textAlign: "center"}}>
              <img className="img-poloroid img-circle" src="http://placehold.it/300x300" alt="random funny image"/>
              <h4>{firstName} {lastName} </h4>
              <small>#: {phone}</small> <br/>
              <small>Email: {email}</small>

            </div>
          </div>
          <div className="col-xs-12 col-sm-6">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Player Stats
                </h3>
              </div>
              <ul className="list-group">
                <li className="list-group-item">
                  <span className="badge">{points}</span>
                  Points:
                </li>
                <li className="list-group-item">
                  Checkins:
                  <span className="pull-right">
                    {checkins}
                  </span>
                </li>
                <li className="list-group-item">
                  Updated:
                  <span className="pull-right">
                    <Moment from={new Date()}>{updated}</Moment>
                  </span>
                </li>
                <li className="list-group-item">
                  Created:
                  <span className="pull-right">
                    <Moment format="MM/DD/YYYY">{created}</Moment>
                  </span>
                </li>
              </ul>
              <div className="panel-footer">
                <button
                  onClick={this.handleUpdate}
                  className="btn btn-block btn-danger">
                  Check in &nbsp;
                  {
                    newUser ?
                    `(Earn 50 points now)` :
                    ''
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  //Handles the update of the users points when checking in
  handleUpdate = () => {
    let {
      _id,
      points,
      newUser,
      firstName,
      lastName,
      checkins,
      updated
    } = this.state;

    //check to see if it has been less then 5 minutes
    // if it has return and don't do anything
    if (Math.floor((new Date() - updated)/60000 < 5)) {
      console.log("its been less then 5")
      return;
    }

    //going to be recycling this so lets set it once and be in sync
    points = newUser ? points+50 : points+20;
    checkins = checkins+1;

    // same goes here
    updated = new Date();

    // Send PUT request and update state
    axios({
      method: 'PUT',
      url: `http://localhost:3030/users/${_id}`,
      params: {
        firstName,
        lastName,
        checkins,
        points,
        updated
      }
    })
    .then(response => {
      this.setState({
        points,
        updated,
        checkins,
        newUser: false
      });
    })
  }

  //Main rendering wow this file is huge, should of started with file management
  render() {
    const { hasPhone, firstName } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo pull-left" alt="logo" />
          <h1 className="pull-left">
            Checkin to Baker
          </h1>
        </header>
        <div className="container">
          <div className="col-xs-12" style={{marginTop: '50px'}}>
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">
                  Welcome, { hasPhone ? firstName : 'Enter Your Number To Get Started' }
                </h3>
              </div>
              <div className="panel-body">
                {/* Create Component for Phone component */}
                { hasPhone == null ? this.renderPhone() : false }
                {/* end phone component  */}

                {/* start of Person Form Make assumption signing up include first sign in. */}
                { hasPhone == false ? this.renderSignUpform() : false }
                {/* End of Person Form  */}

                {/* Start the dashboard */}
                { hasPhone ? this.renderDashboard() : false }
                {/* End the dashboard */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
