import Breadcrumbs from '../components/Breadcrumbs';

const PageShell = ({ title, subtitle, breadcrumbs = [], rightSlot, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Breadcrumbs items={breadcrumbs} />
              {title && (
                <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-3 text-base sm:text-lg text-purple-200 max-w-3xl">
                  {subtitle}
                </p>
              )}
            </div>
            {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default PageShell;
