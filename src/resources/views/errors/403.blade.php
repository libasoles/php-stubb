@extends('layouts.error')

@section('title', 'Not authorized')

@section('content')
    @parent
    <div class="head-line secondary-text-color">
        403
    </div>
    <div class="subheader primary-text-color">
        Oops, you're not authorized<br>
        to visit this area.
    </div>
    <hr>
    <div class="clearfix"></div>
    <div class="context primary-text-color">
        <!-- doesn't use context_content because it's ALWAYS the same thing -->
        <p>
            You may want to head back to the homepage.<br />
            If you think something is broken, report a problem.
        </p>
    </div>
    <div class="buttons-container">
        <a class="border-button" href="/">Go To Homepage</a>
        <a class="border-button" href="mailto:info@betterdont.com" target="_blank">Report A Problem</a>
    </div>
@endsection

@section('scripts')
    <script>
        function ErrorPage(e, t, n){this.$container = $(e), this.$contentContainer = this.$container.find(n == "sign"?".sign-container":".content-container"), this.pageType = t, this.templateName = n}ErrorPage.prototype.centerContent = function(){var e = this.$container.outerHeight(), t = this.$contentContainer.outerHeight(), n = (e - t) / 2, r = this.templateName == "sign"? - 100:0; this.$contentContainer.css("top", n + r)}, ErrorPage.prototype.initialize = function(){var e = this; this.centerContent(), this.$container.on("resize", function(t){t.preventDefault(), t.stopPropagation(), e.centerContent()}), this.templateName == "plain" && window.setTimeout(function(){e.$contentContainer.addClass("in")}, 500), this.templateName == "sign" && $(".sign-container").animate({textIndent:0}, {step:function(e){$(this).css({transform:"rotate(" + e + "deg)", "transform-origin":"top center"})}, duration:1e3, easing:"easeOutBounce"})}, ErrorPage.prototype.createTimeRangeTag = function(e, t){return"<time utime=" + e + ' simple_format="MMM DD, YYYY HH:mm">' + e + "</time> - <time utime=" + t + ' simple_format="MMM DD, YYYY HH:mm">' + t + "</time>."}, ErrorPage.prototype.handleStatusFetchSuccess = function(e, t){if (e == "503")$("#replace-with-fetched-data").html(t.status.description);  else if (!t.scheduled_maintenances.length)$("#replace-with-fetched-data").html("<em>(there are no active scheduled maintenances)</em>");  else{var n = t.scheduled_maintenances[0]; $("#replace-with-fetched-data").html(this.createTimeRangeTag(n.scheduled_for, n.scheduled_until)), $.fn.localizeTime()}}, ErrorPage.prototype.handleStatusFetchFail = function(e){$("#replace-with-fetched-data").html("<em>(enter a valid StatusPage.io url)</em>")}, ErrorPage.prototype.fetchStatus = function(e, t){if (!e || !t || t == "403")return; var n = "", r = this; t == "503"?n = e + "/api/v2/status.json":n = e + "/api/v2/scheduled-maintenances/active.json", $.ajax({type:"GET", url:n}).success(function(e, n){r.handleStatusFetchSuccess(t, e)}).fail(function(e, n){r.handleStatusFetchFail(t)})};
        var ep = new ErrorPage('body', "403", "plain");
        ep.initialize();
        // hack to make sure content stays centered >_<
        $(window).on('resize', function() {
        $('body').trigger('resize')
        });
    </script>
@endsection

