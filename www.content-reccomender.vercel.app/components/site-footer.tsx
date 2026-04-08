export default function SiteFooter() {
  return (
    <footer className="bg-[#F8F8F7] py-6 px-6 relative z-10 border-t border-[#D3D1CF]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-y-4">
          <div className="flex items-center flex-wrap justify-center">
            <svg
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 204 146.6"
              width="24px"
              height="24px"
              className="mr-2"
            >
              <defs>
                <style>{`.st0 { fill: #1d1c1b; }`}</style>
              </defs>
              <rect className="st0" x="43.9" y="50.3" width="64.3" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" y="50.3" width="35.3" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="124.1" y="50.3" width="40.3" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="129.9" y="37.8" width="34.5" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="168.9" y="37.8" width="27.3" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="157.3" y="25" width="31.1" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="167.1" y="12.5" width="9.2" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="74.3" y="112.6" width="15.9" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="101.8" y="112.6" width="10.4" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="117" y="112.6" width="28" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="131" y="100.1" width="11.6" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="52.4" y="112.6" width="9.2" height="9" rx="2.6" ry="2.6"></rect>
              <path
                className="st0"
                d="M94.7,127.7c0-1.4,1.1-2.6,2.6-2.6h4c1.4,0,2.6,1.1,2.6,2.6v3.9c0,1.4-1.1,2.6-2.6,2.6h-4c-1.4,0-2.6-1.1-2.6-2.6v-3.9Z"
              ></path>
              <rect className="st0" x="85.8" y="137.6" width="8.7" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="120.4" width="11.4" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="55.8" y="37.8" width="29" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="109.7" y="12.5" width="17.6" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="98" width="17.6" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="98.8" y="25" width="28.5" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="187.4" y="50.3" width="16.6" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="30.6" y="62.8" width="82.1" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="105.1" y="87.8" width="32.1" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="43.9" y="75.3" width="104.3" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="27.9" y="87.8" width="38.8" height="8.7" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="63.3" y="100.1" width="12.7" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="108.1" y="100.1" width="13.7" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="39.8" y="100.1" width="12.9" height="9" rx="2.6" ry="2.6"></rect>
              <rect className="st0" x="124.1" y="62.8" width="33.1" height="8.7" rx="2.6" ry="2.6"></rect>
            </svg>
            <span className="text-[#1D1C1B] font-semibold text-sm">Content Recommender</span>
            <span className="mx-3 text-[#D3D1CF]">|</span>
            <span className="text-[#1D1C1B]/60 text-xs">© {new Date().getFullYear()} All rights reserved</span>
          </div>

          <div className="flex items-center gap-x-6 text-xs">
            <div className="flex space-x-3 ml-2">
              {["website", "twitter", "github"].map((social) => (
                <a
                  key={social}
                  href={
                    social === "website"
                      ? "https://www.twelvelabs.io/"
                      : social === "twitter"
                        ? "https://x.com/twelve_labs"
                        : "https://github.com/twelvelabs-io"
                  }
                  className="text-[#1D1C1B]/50 hover:text-[#1D1C1B] transition-colors"
                  aria-label={`${social} link`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {social === "website" && (
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                        clipRule="evenodd"
                      />
                    )}
                    {social === "twitter" && (
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    )}
                    {social === "github" && (
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.923.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
