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
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Teams Accordion Toggle
document.querySelectorAll('.team-item.collapsible').forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close other items
        document.querySelectorAll('.team-item.collapsible').forEach(otherItem => {
            otherItem.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Modal Logic
const modal = document.getElementById('applyModal');
const modalRoleName = document.getElementById('modalRoleName');
const applyForm = document.getElementById('applicationForm');
const successMessage = document.getElementById('successMessage');

// Open Modal
document.querySelectorAll('.apply-link, .apply-link-talent, .btn-primary[href="#roles"]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        if (trigger.classList.contains('apply-link') || trigger.classList.contains('apply-link-talent')) {
            e.preventDefault();
            let roleName = "General Application";
            
            if (trigger.classList.contains('apply-link')) {
                const jobCard = trigger.closest('.job-card');
                roleName = jobCard.querySelector('h4').textContent;
            }
            
            modalRoleName.textContent = roleName;
            
            // Reset form
            applyForm.style.display = 'grid';
            successMessage.style.display = 'none';
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        }
    });
});

// Close Modal
const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Form Submission
applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate API call
    const submitBtn = applyForm.querySelector('button');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        applyForm.style.display = 'none';
        successMessage.style.display = 'block';
        submitBtn.textContent = 'Submit Application';
        submitBtn.disabled = false;
    }, 1500);
});
