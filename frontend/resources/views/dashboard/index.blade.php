<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    @vite('resources/css/app.css')

</head>
<body>
@if(Session::has('user'))
    <p>Welcome, {{ Session::get('user')['name'] }}!</p>
@else
    <p>Not logged in.</p>
@endif

</body>
</html>