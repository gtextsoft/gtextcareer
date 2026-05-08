// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('[data-reveal]').forEach(el => {
    observer.observe(el);
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Teams Accordion Toggle
document.querySelectorAll('.team-item .team-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.closest('.team-item.collapsible');
        if (!item) return;
        const isExpanded = item.classList.contains('expanded');

        // Close other items
        document.querySelectorAll('.team-item.collapsible').forEach(otherItem => {
            otherItem.classList.remove('expanded');
        });

        // Toggle current item
        if (!isExpanded) {
            item.classList.add('expanded');
        }
    });
});

// Opportunities filters
const roleSearch = document.getElementById('roleSearch');
const teamFilter = document.getElementById('teamFilter');
const locationFilter = document.getElementById('locationFilter');
const rolesCount = document.getElementById('rolesCount');
const noResultsMessage = document.getElementById('noResultsMessage');
const allJobCards = Array.from(document.querySelectorAll('.job-card'));
const allJobCategories = Array.from(document.querySelectorAll('.job-category'));

const filterJobs = () => {
    const searchValue = (roleSearch?.value || '').trim().toLowerCase();
    const teamValue = teamFilter?.value || 'all';
    const locationValue = locationFilter?.value || 'all';
    let visibleCount = 0;

    allJobCards.forEach((card) => {
        const role = (card.dataset.role || '').toLowerCase();
        const team = card.dataset.team || '';
        const location = card.dataset.location || '';

        const roleMatch = !searchValue || role.includes(searchValue);
        const teamMatch = teamValue === 'all' || team === teamValue;
        const locationMatch = locationValue === 'all' || location === locationValue;
        const shouldShow = roleMatch && teamMatch && locationMatch;

        card.style.display = shouldShow ? 'flex' : 'none';
        if (shouldShow) visibleCount += 1;
    });

    // Hide team sections that have no visible roles
    allJobCategories.forEach((category) => {
        const cards = Array.from(category.querySelectorAll('.job-card'));
        const hasVisibleCard = cards.some((card) => card.style.display !== 'none');
        category.style.display = hasVisibleCard ? 'block' : 'none';
    });

    if (rolesCount) {
        rolesCount.textContent = visibleCount === 1 ? '1 opportunity' : `${visibleCount} opportunities`;
    }
    if (noResultsMessage) {
        noResultsMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
};

roleSearch?.addEventListener('input', filterJobs);
teamFilter?.addEventListener('change', filterJobs);
locationFilter?.addEventListener('change', filterJobs);
filterJobs();

// Modal + email application flow
const modal = document.getElementById('applyModal');
const modalRoleName = document.getElementById('modalRoleName');
const applyForm = document.getElementById('applicationForm');
const successMessage = document.getElementById('successMessage');
const selectedRoleInput = document.getElementById('selectedRoleInput');
const roleSelectInput = document.getElementById('roleSelectInput');

const fullNameInput = document.getElementById('fullNameInput');
const emailInput = document.getElementById('emailInput');
const phoneInput = document.getElementById('phoneInput');
const portfolioInput = document.getElementById('portfolioInput');
const messageInput = document.getElementById('messageInput');
let bodyScrollLockPadding = '';
let modalSource = 'index';
const knownRoles = [
    'Sales Manager',
    'Investment Consultant',
    'Video Editor',
    'Graphic Designer',
    'CFU Specialist',
    'Software Engineer',
    'AI Engineer',
];

const prepareModal = (roleName, source = 'index') => {
    if (selectedRoleInput) selectedRoleInput.value = roleName;
    if (roleSelectInput) {
        if (knownRoles.includes(roleName)) {
            roleSelectInput.value = roleName;
        } else if (roleName === 'Talent Pool Application' || roleName === 'Talent Network Application') {
            roleSelectInput.value = 'General Talent Pool';
        } else {
            roleSelectInput.value = '';
        }
    }
    if (modalRoleName) modalRoleName.textContent = roleName || 'Select your preferred role and submit your application.';
    if (applyForm) applyForm.style.display = 'grid';
    if (successMessage) successMessage.style.display = 'none';
    modalSource = source;
};

const openModal = () => {
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    bodyScrollLockPadding = document.body.style.paddingRight;
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
};

const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = bodyScrollLockPadding;
};

document.querySelectorAll('.apply-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const roleName = link.closest('.job-card')?.dataset.role || 'Open Role';
        prepareModal(roleName, 'index-roles');

        if (modal) {
            openModal();
        }
    });
});

document.querySelectorAll('.modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const roleName = trigger.getAttribute('data-modal-role') || 'General Application';
        prepareModal(roleName, 'index-cta');
        openModal();
    });
});

document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

applyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = roleSelectInput?.value || selectedRoleInput?.value || 'Open Role';
    const fullName = fullNameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const phone = phoneInput?.value?.trim() || '';
    const portfolio = portfolioInput?.value?.trim() || '';
    const note = messageInput?.value?.trim() || 'N/A';

    const submitBtn = applyForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    const payload = {
        email,
        role,
        fullName,
        phone,
        portfolio,
        note,
        sourcePage: modalSource,
        subject: `New Career Application: ${role}`,
        message: `Role: ${role}\nFull Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nPortfolio/LinkedIn: ${portfolio}\nShort Note: ${note}`,
    };

    fetch('https://formspree.io/f/mzdojbrq', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error('Request failed');
            }
            if (applyForm) applyForm.style.display = 'none';
            if (successMessage) successMessage.style.display = 'block';
        })
        .catch(() => {
            const subject = encodeURIComponent(`Application for ${role}`);
            const body = encodeURIComponent(
                `Hello HR Team,\n\nI would like to apply for the ${role} role.\n\nFull Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nPortfolio/LinkedIn: ${portfolio}\nShort Note: ${note}\n\nRegards,\n${fullName}`
            );
            window.location.href = `mailto:hr@gtextholdings.com?subject=${subject}&body=${body}`;
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
            }
        });
});
