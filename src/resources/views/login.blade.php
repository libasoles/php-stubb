@extends('layouts.app')

@section('css')
    <link href="/src/app_modules/login/style.css" rel="stylesheet" type="text/css">
@endsection

@section('js')
    <script src="/src/app_modules/login/login.js"></script>
@endsection

@section('content')
    @parent

    <div class="login-page">
      <div class="form">
          <header>
            <div class="logo">
                <img src="/img/logo.png" alt="logo" />
            </div>
            <h1>Stubb.</h1>
          </header>
        <form class="register-form">
          <input type="text" placeholder="name"/>
          <input type="password" placeholder="password"/>
          <input type="text" placeholder="email address"/>
          <button>create</button>
          <p class="message">Already registered? <a href="#">Sign In</a></p>
        </form>
        <form class="login-form">
          <input type="text" placeholder="username"/>
          <input type="password" placeholder="password"/>
          <button>login</button>
          <p class="message">Not registered? <a href="#">Create an account</a></p>
        </form>
      </div>
    </div>

@endsection