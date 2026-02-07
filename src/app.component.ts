import { Component, AfterViewInit, ViewChildren, ElementRef, QueryList, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var anime: any;
declare var Lenis: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styles: [`
    .nav-scrolled {
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    .nav-transparent {
      background-color: transparent;
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }
    /* Smooth opacity transition for background layers */
    .bg-layer {
      transition: opacity 1.2s ease-in-out, transform 10s ease-out;
      will-change: opacity, transform;
    }
    .bg-layer.active {
      opacity: 1;
      transform: scale(1.05);
      z-index: 10;
    }
    .bg-layer.inactive {
      opacity: 0;
      transform: scale(1);
      z-index: 0;
    }
  `]
})
export class AppComponent implements AfterViewInit {
  // App State
  mobileMenuOpen = signal(false);
  isNavScrolled = signal(false);

  // Loader State
  isLoading = signal(true);
  loaderStep = signal(0); // 0: Text 1, 1: Text 2, 2: Video Minimize, 3: Done

  // Video Modal State
  videoModalOpen = signal(false);
  activeVideoUrl = signal<string>('');

  // Property State
  activePropertyId = signal<number>(1);

  // Refs
  @ViewChildren('observeSection') sections!: QueryList<ElementRef>;
  @ViewChildren('propertySection') propertySections!: QueryList<ElementRef>;

  // Lenis Instance
  private lenis: any;

  properties = [
    {
      id: 1,
      title: "The Azure Penthouse",
      location: "Downtown Metropolis",
      description: "Floating above the city skyline, the Azure Penthouse defines modern luxury. With floor-to-ceiling windows, a private infinity pool, and smart-home integration, this residence offers an unparalleled lifestyle for the discerning elite.",
      price: "$4,500,000",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1920&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/3205634/3205634-hd_1920_1080_25fps.mp4",
      beds: 4,
      baths: 3,
      sqft: 3200
    },
    {
      id: 2,
      title: "Serenity Coastal Villa",
      location: "Pacific Highlands",
      description: "Perched on the edge of the cliffs, Serenity Villa merges seamless indoor-outdoor living. Wake up to the sound of crashing waves and enjoy sunset cocktails on your expansive teak deck.",
      price: "$6,850,000",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1920&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/7578544/7578544-uhd_2560_1440_30fps.mp4",
      beds: 5,
      baths: 4.5,
      sqft: 4500
    },
    {
      id: 3,
      title: "Urban Industrial Loft",
      location: "Arts District",
      description: "A masterpiece of adaptive reuse, this historic loft features 20ft ceilings, exposed brick, and polished concrete floors. The open-concept design is a blank canvas for the creative soul.",
      price: "$2,200,000",
      image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1920&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/3205634/3205634-hd_1920_1080_25fps.mp4",
      beds: 2,
      baths: 2,
      sqft: 1800
    },
    {
      id: 4,
      title: "The Forest Retreat",
      location: "Alpine Ridge",
      description: "Escape to nature without compromising on luxury. This architectural marvel is hidden within the pines, featuring sustainable materials, geothermal heating, and a glass-walled spa.",
      price: "$3,100,000",
      image: "https://images.unsplash.com/photo-1600596542815-2788866afe90?q=80&w=1920&auto=format&fit=crop",
      video: "https://videos.pexels.com/video-files/7578544/7578544-uhd_2560_1440_30fps.mp4",
      beds: 3,
      baths: 3,
      sqft: 2600
    }
  ];

  toggleMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  openVideoModal(videoUrl: string) {
    this.activeVideoUrl.set(videoUrl);
    this.videoModalOpen.set(true);
    if (this.lenis) this.lenis.stop();
  }

  closeVideoModal() {
    this.videoModalOpen.set(false);
    this.activeVideoUrl.set('');
    if (this.lenis) this.lenis.start();
  }

  ngAfterViewInit() {
    // Reset scroll to top immediately
    window.scrollTo(0, 0);

    // Initialize systems
    this.initLenis();
    this.runPreloaderSequence();
    this.initScrollObservers();
    this.initPropertyScrollSpy();
    this.initNavScrollListener();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  runPreloaderSequence() {
    // STOP scrolling via Lenis only. Do NOT modify body.style.overflow manually.
    if (this.lenis) this.lenis.stop();

    // Step 0: Initial state (Text 1 Visible)

    // Step 1: Switch Text (after 1.5s)
    setTimeout(() => {
      this.loaderStep.set(1); // Shows Second Text
    }, 1500);

    // Step 2: Minimize Video (after 3.5s)
    setTimeout(() => {
      this.loaderStep.set(2);
      this.isLoading.set(false);

      // RESUME scrolling
      if (this.lenis) {
        this.lenis.start();
        // Force a resize calculation to ensure Lenis knows the correct height after animation
        this.lenis.resize();
      }

      // Trigger hero text animations now that loader is moving away
      setTimeout(() => {
        this.initHeroAnimation();
      }, 500);

    }, 3500);
  }

  initNavScrollListener() {
    window.addEventListener('scroll', () => {
      this.isNavScrolled.set(window.scrollY > 50);
    });
  }

  initHeroAnimation() {
    anime({
      targets: ['.hero-title', '.hero-subtitle', '.hero-cta'],
      opacity: [0, 1],
      translateY: [50, 0],
      delay: anime.stagger(200),
      easing: 'easeOutExpo',
      duration: 1500
    });
  }

  initScrollObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;

          if (target.classList.contains('anim-fade-up')) {
            anime({
              targets: target,
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 1200,
              easing: 'easeOutQuart'
            });
          }
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.anim-fade-up').forEach(el => observer.observe(el));
  }

  initPropertyScrollSpy() {
    const options = {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = Number(entry.target.getAttribute('data-id'));
          if (id) {
            this.activePropertyId.set(id);
          }
        }
      });
    }, options);

    document.querySelectorAll('.property-item-trigger').forEach(el => {
      observer.observe(el);
    });
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      this.lenis.scrollTo(el); // Use Lenis for smooth scroll to anchor
      this.mobileMenuOpen.set(false);
    }
  }
}
