import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return ( 
    <div className="dashboard">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
              <div className="display-4">
              <div className="row">
                <div className="col-md-10 mb-10">
                    <p className="mb-10">
                      Welcome To My Sandy's World
                    </p>
                    <p className="lead text-muted"> Thanks, For Using My App Please Give Your Feedback to 
                      <span className="mail">
                        <a href="mailto:sandhanireactdeveloper@gmail.com?Subject=Hello%20again" target="_top">
                          sandhanireactdeveloper@gmail.com</a>
                          </span> 
                      </p>
                  </div>
                  <div className="col-md-6">
                    
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps
)(Dashboard);