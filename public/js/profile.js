<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - RetroForum Y2K</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="page-container">
        <div class="profile-card">
            <div class="profile-header">
                <img id="profileAvatar" src="https://web.archive.org/web/20091027143946im_/http://www.geocities.com/mailbaby2002/roseglitter.gif" alt="Avatar" class="profile-avatar">
                <h2 id="profileUsername">Loading...</h2>
                <span id="profileRole" style="color: #fff; font-size: 12px;">USER</span>
            </div>
            <div class="profile-content">
                <div class="profile-info">
                    <div class="profile-label">📧 Email:</div>
                    <div class="profile-value" id="profileEmail">-</div>

                    <div class="profile-label">📝 Bio:</div>
                    <div class="profile-value" id="profileBio">-</div>

                    <div class="profile-label">📅 Member since:</div>
                    <div class="profile-value" id="profileCreated">-</div>
                </div>

                <div class="profile-info">
                    <div class="profile-label">📊 Stats:</div>
                    <div class="profile-value">
                        <strong id="totalPosts">0</strong> posts • 
                        <strong id="totalComments">0</strong> comments • 
                        <strong id="boardsParticipated">0</strong> boards participated
                    </div>
                </div>

                <button onclick="window.location.href='edit-profile.html'" class="btn-primary">✏ Edit Profile</button>
            </div>
        </div>

        <div class="form-window">
            <div class="form-window-header">[ ♡ My Recent Posts ♡ ]</div>
            <div class="form-window-content">
                <div id="userPosts" class="loading">Loading posts...</div>
            </div>
        </div>
    </div>

    <footer>
        <p>♡ © 2025 RetroForum Y2K ♡</p>
    </footer>

    <script src="components/navbar.js"></script>
    <script src="js/profile.js"></script>
</body>
</html>