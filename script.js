// Copy to clipboard functionality
function copyToClipboard(button, text) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    
    try {
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy:', err);
        button.textContent = 'Failed to copy';
        
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    }
    
    document.body.removeChild(textarea);
}

// Show pre-production disclaimer banner
function showPreProdDisclaimer() {
    // Check if we're on pre-prod by looking at the URL path
    if (window.location.pathname.includes('pre-prod')) {
        const disclaimer = document.createElement('div');
        disclaimer.className = 'preprod-disclaimer';
        disclaimer.innerHTML = `
            <div class="preprod-content">
                <span class="preprod-icon">⚠️</span>
                <div>
                    <strong>PRE-PRODUCTION ENVIRONMENT</strong><br>
                    <span style="font-size: 0.9rem;">This is a development/testing portal. For official releases, please visit the <a href="http://clke/" class="prod-link">production site</a>.</span>
                </div>
            </div>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        if (container && container.firstChild) {
            container.insertBefore(disclaimer, container.firstChild);
        }
    }
}

// Load releases from JSON
async function loadAllReleases() {
    try {
        const response = await fetch('releases.json');
        const data = await response.json();
        
        // Store data globally for news banner updates
        window.releasesData = data;
        
        // Render each platform
        renderPlatformReleases('PTL', data.PTL || []);
        renderPlatformReleases('WCL', data.WCL || []);
        renderPlatformReleases('NVL', data.NVL || []);
        
        // Update news banner for default platform (PTL)
        updateNewsBanner('PTL', data.PTL || []);
    } catch (error) {
        console.error('Error loading releases:', error);
        ['PTL', 'WCL', 'NVL'].forEach(platform => {
            const tbody = document.getElementById(platform + '-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #ef4444;">Error loading releases. Please refresh the page.</td></tr>';
            }
        });
        // Hide news banner on error
        document.getElementById('newsBanner').style.display = 'none';
    }
}

// Update news banner with latest stable release for platform
function updateNewsBanner(platform, releases) {
    const newsContent = document.getElementById('newsRelease');
    const newsBanner = document.getElementById('newsBanner');
    
    if (!releases || releases.length === 0) {
        newsBanner.style.display = 'none';
        return;
    }
    
    // Find the latest stable or LTS release
    const latestStable = releases.find(r => r.status === 'Stable' || r.status === 'LTS');
    
    if (!latestStable) {
        newsBanner.style.display = 'none';
        return;
    }
    
    newsBanner.style.display = 'flex';
    newsContent.innerHTML = `
        <a href="${latestStable.manifestLink}" target="_blank" class="news-link">
            ${latestStable.releaseTag}
        </a>
        <span class="news-date">Released on ${new Date(latestStable.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    `;
}

// Render releases for a specific platform
function renderPlatformReleases(platform, releases) {
    const tbody = document.getElementById(platform + '-tbody');
    if (!tbody) return;
    
    if (releases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #888;">' + platform + ' releases coming soon...</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    releases.forEach(release => {
        const row = document.createElement('tr');
        
        // Status badge class
        let badgeClass = 'badge-stable';
        if (release.status === 'LTS') badgeClass = 'badge-lts';
        if (release.status === 'Legacy') badgeClass = 'badge-legacy';
        
        row.innerHTML = `
            <td><strong><a href="${release.manifestLink}" target="_blank" class="release-tag-link">${release.releaseTag}</a></strong></td>
            <td>${release.releaseDate}</td>
            <td>${release.kernelVersion}</td>
            <td><span class="badge ${badgeClass}">${release.status}</span></td>
            <td>${release.features}</td>
            <td><a href="${release.imageLink}" class="btn-link" ${release.imageLink === '#' ? 'style="pointer-events: none; opacity: 0.5;"' : 'target="_blank"'}>Image</a></td>
            <td><a href="${release.jiraLink}" target="_blank" class="jira-link">${release.jiraTicket}</a></td>
            <td><button class="btn-download" onclick="showCloneScript('${release.releaseTag}')">Clone Script</button></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Platform switching functionality
function switchPlatform(platform) {
    // Update active tab
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update active content
    const contents = document.querySelectorAll('.platform-content');
    contents.forEach(content => content.classList.remove('active'));
    document.getElementById(platform + '-releases').classList.add('active');
    
    // Update title
    document.getElementById('platformTitle').textContent = platform + ': ALOS Kernel Release History';
    
    // Update news banner with platform's latest stable release
    if (window.releasesData && window.releasesData[platform]) {
        updateNewsBanner(platform, window.releasesData[platform]);
    }
}

// Show clone script modal
function showCloneScript(releaseTag) {
    const modal = document.getElementById('cloneModal');
    const modalBody = document.getElementById('modalBody');
    
    const manifestUrl = 'https://github.com/intel-restricted/os.android.externalmirror.alos.kernel-manifest';
    const kernelUrl = 'https://github.com/intel-restricted/os.android.externalmirror.alos.kernel-common';
    const fatcatUrl = 'https://github.com/intel-restricted/os.android.externalmirror.alos.kernel-desktop-private-devices-google-x86-64-intel-fatcat';
    const branchName = 'clke/android17-6.18-desktop-intelnext';
    
    const repoInitCmd = `repo init -u ${manifestUrl} -b refs/tags/${releaseTag} -m manifest.xml`;
    const syncBuildCmds = `repo init -u ${manifestUrl} -b refs/tags/${releaseTag} -m manifest.xml

repo sync -c -q -j16

repo forall -c "git lfs pull"

tools/bazel run //common:kernel_x86_64_dist

tools/bazel run --config=fatcat //private/devices/google/x86-64/intel/common:dist`;
    
    // Create modal content with proper event handlers
    modalBody.innerHTML = `
        <div class="modal-section">
            <h3>Kernel Manifest Repository</h3>
            <p><strong>Repository:</strong> <a href="${manifestUrl}" target="_blank">${manifestUrl}</a></p>
            <p><strong>Use tag to reproduce tested release:</strong></p>
            <div class="code-block">
                <pre><code>${repoInitCmd}</code></pre>
                <button class="copy-btn" id="copyBtn1">Copy</button>
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Internal Repositories</h3>
            <p>Repositories to keep looking at to submit changes via PR to the branch name <code>${branchName}</code></p>
            <ul>
                <li><strong>Kernel:</strong> <a href="${kernelUrl}" target="_blank">${kernelUrl}</a></li>
                <li><strong>Intel/fatcat:</strong> <a href="${fatcatUrl}" target="_blank">${fatcatUrl}</a></li>
            </ul>
        </div>
        
        <div class="modal-section">
            <h3>Sync and Build Kernel</h3>
            <div class="code-block">
                <pre><code>${syncBuildCmds}</code></pre>
                <button class="copy-btn" id="copyBtn2">Copy</button>
            </div>
        </div>
    `;
    
    // Attach event listeners after content is created
    document.getElementById('copyBtn1').onclick = function() {
        copyToClipboard(this, repoInitCmd);
    };
    
    document.getElementById('copyBtn2').onclick = function() {
        copyToClipboard(this, syncBuildCmds);
    };
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('cloneModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('cloneModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Load releases from JSON on page load
document.addEventListener('DOMContentLoaded', () => {
    // Show pre-prod disclaimer if on pre-prod environment
    showPreProdDisclaimer();
    
    loadAllReleases();
    
    const blocks = document.querySelectorAll('.instruction-block');
    blocks.forEach((block, index) => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(20px)';
        block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        block.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(block);
    });
    
    // Table rows animation
    const rows = document.querySelectorAll('.release-table tbody tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        row.style.transitionDelay = `${index * 0.1}s`;
        
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, 100);
    });
});
