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
        
        <form class="register-form @yield('register')" role="form" method="POST" action="{{ route('register') }}">
            
            {{ csrf_field() }}
            
            <input id="name" type="text" class="form-control {{ $errors->has('name') ? 'error' : '' }}" name="name"  placeholder="name" value="{{ old('name') }}" required autofocus>
            @if ($errors->has('name'))
                <span class="help-block">
                    <strong>{{ $errors->first('name') }}</strong>
                </span>
            @endif

            <input id="email" type="email" class="form-control {{ $errors->has('email') ? 'error' : '' }}" name="email" placeholder="email address" value="{{ old('email') }}" required autofocus>
            @if ($errors->has('email'))
            <span class="help-block">
                <strong>{{ $errors->first('email') }}</strong>
            </span>
            @endif
            
            <input id="password" type="password" class="form-control {{ $errors->has('password') ? 'error' : '' }}" name="password" placeholder="password" required>
            @if ($errors->has('password'))
            <span class="help-block">
                <strong>{{ $errors->first('password') }}</strong>
            </span>
            @endif
            <input id="password-confirm" type="password" class="form-control {{ $errors->has('password_confirmation') ? 'error' : '' }}" name="password_confirmation" placeholder="confirm password" required>


            <button>create</button>
            <p class="message">Already registered? <a href="#">Sign In</a></p>
        </form>
        
        <form class="login-form @yield('login')" role="form" method="POST" action="{{ route('login') }}">
            {{ csrf_field() }}

            <input id="email" type="email" class="form-control {{ $errors->has('email') ? 'error' : '' }}" name="email" placeholder="email address" value="{{ old('email') }}" required autofocus>
            @if ($errors->has('email'))
            <span class="help-block">
                <strong>{{ $errors->first('email') }}</strong>
            </span>
            @endif

            <input id="password" type="password" class="form-control {{ $errors->has('password') ? 'error' : '' }}" name="password" placeholder="password" required>
            @if ($errors->has('password'))
            <span class="help-block">
                <strong>{{ $errors->first('password') }}</strong>
            </span>
            @endif

            <div class="form-group">
                <div class="">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" name="remember" {{ old('remember') ? 'checked' : '' }}> Remember Me
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <div class="">
                    <button type="submit" class="btn btn-primary">
                        Login
                    </button>
                </div>
            </div>
            <p class="message">Not registered? <a href="#">Create an account</a></p>
            <a class="message" href="{{ route('password.request') }}" style="display: none;">
                Forgot Your Password?
            </a>
        </form>
    </div>
</div>

@endsection