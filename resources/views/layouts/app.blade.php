<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>@yield('title', 'Dashboard')</title>
    <!-- <meta name="csrf-token" content="{{ csrf_token() }}"> -->
     <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- CSS Global (SB Admin) --}}
    <link href="{{ asset('css/styles.css') }}" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">

    {{-- Slot tambahan CSS per halaman --}}
    @stack('styles')
</head>
<body class="sb-nav-fixed">
    {{-- Navbar --}}
    <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
        <a class="navbar-brand ps-3" href="{{ url('/') }}">HAVVA</a>
        <button class="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle">
            <i class="fas fa-bars"></i>
        </button>
        <ul class="navbar-nav ms-auto me-3 me-lg-4">
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user fa-fw"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#">Settings</a></li>
                    <li><a class="dropdown-item" href="#">Activity Log</a></li>
                    <li><hr class="dropdown-divider" /></li>
                    <li><a class="dropdown-item" href="#">Logout</a></li>
                </ul>
            </li>
        </ul>
    </nav>

    {{-- Sidebar + Content --}}
    <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
            <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div class="sb-sidenav-menu">
                    <div class="nav">
                        <div class="sb-sidenav-menu-heading">Menu</div>
                        <a class="nav-link" href="{{ url('/') }}">
                            <div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                            Dashboard
                        </a>
                        <a class="nav-link" href="{{ url('/broadcast') }}">
                            <div class="sb-nav-link-icon"><i class="fas fa-comments"></i></div>
                            Template / Chat
                        </a>
<a class="nav-link collapsed" href="#" data-bs-toggle="collapse" data-bs-target="#collapseKontak" aria-expanded="false" aria-controls="collapseKontak">
    <div class="sb-nav-link-icon"><i class="fas fa-address-book"></i></div>
    Kontak
    <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div>
</a>

<div class="collapse" id="collapseKontak" aria-labelledby="headingKontak" data-bs-parent="#sidenavAccordion">
    <nav class="sb-sidenav-menu-nested nav">
        
        <a class="nav-link" href="{{ url('/kontakdb') }}">
            Kontak DB
        </a>
        
        <a class="nav-link" href="{{ url('/contact') }}">
            Custom Kontak
        </a>
    </nav>
</div>
                        <a class="nav-link" href="{{ url('/config') }}">
                            <div class="sb-nav-link-icon"><i class="fas fa-cogs"></i></div>
                            Config
                        </a>
                    </div>
                </div>
                <div class="sb-sidenav-footer">
                    <div class="small">Logged in as:</div>
                    Ardion Massaid
                </div>
            </nav>
        </div>

        <div id="layoutSidenav_content">
            <main class="p-4">
                @yield('content')
            </main>
            <footer class="py-4 bg-light mt-auto">
                <div class="container-fluid px-4">
                    <div class="d-flex align-items-center justify-content-between small">
                        <div class="text-muted">Copyright &copy; Havva 2025</div>
                        <div>
                            <a href="#">Privacy Policy</a>
                            &middot;
                            <a href="#">Terms &amp; Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>

    {{-- Script Global --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('js/scripts.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js"></script>

    {{-- Slot tambahan JS per halaman --}}
    @stack('scripts')
</body>
</html>
