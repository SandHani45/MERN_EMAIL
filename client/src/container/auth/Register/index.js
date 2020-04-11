import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { registerUser, oauthFacebook } from "../../../actions/authAction";
import TextFieldGroup from "./../../../components/TextFieldGroup";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'

class Register extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      password: "",
      mobile: "",
      errors: {}
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
  }
  // redireact if login
  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      mobile: this.state.mobile
    };
    console.log(newUser)
    this.props.registerUser(newUser, this.props.history);
  }

  responseFacebook(res) {
    console.log(res.accessToken)
    this.props.oauthFacebook(res.accessToken);
    if (!this.props.errorMessage) {
      this.props.history.push('/dashboard');
    }
  }
  render() {
    //   const errors = this.state.errors;
    const { errors } = this.state;
    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-6 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              <p className="lead text-center">
                Create Your E-Verify Account
              </p>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  placeholder="name"
                  name="name"
                  value={this.state.name}
                  onChange={this.onChange}
                  error={errors.name}
                />
                <TextFieldGroup
                  placeholder="email"
                  name="email"
                  type="email"
                  value={this.state.email}
                  onChange={this.onChange}
                  error={errors.email}
                  info="Please enter valid email, You will get verification link "
                />
                <TextFieldGroup
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  error={errors.password}
                />
                <TextFieldGroup
                  placeholder="Mobile number"
                  name="mobile"
                  type="number"
                  value={this.state.mobile}
                  onChange={this.onChange}
                  error={errors.mobile}
                  
                />
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
            <div className="col-md-6 m-auto">
              <div className="alert alert-primary">
                Or sign up using third-party services
              </div>
                <FacebookLogin
                  appId="1334656953381300"
                  render={renderProps => (
                    <button style={{ marginRight: 15 }} className="btn btn-primary" onClick={renderProps.onClick}>Facebook</button>
                  )}
                  fields="name,email,picture"
                  callback={this.responseFacebook}
                  cssClass="btn btn-outline-primary"
                />
                {/* <GoogleLogin 
                  clientId="number"
                  render={renderProps => (
                    <button className="btn btn-danger" onClick={renderProps.onClick} disabled={renderProps.disabled}>Google</button>
                  )}
                  onSuccess={this.responseGoogle}
                  onFailure={this.responseGoogle}
                  className="btn btn-outline-danger"
                /> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
// Register.propTypes ={
//   registerUser: PropTypes.func.isRequired,
//   auth: PropTypes.object.isRequired
// }

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  { registerUser, oauthFacebook }
)(withRouter(Register));