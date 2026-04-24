import { CheckCheck, GitBranch, Layers3, Save, Share2, Sparkles } from 'lucide-react'

export function Features() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Everything you need to move from idea to execution
          </h2>
          <p>
            Generate multiple project options, filter quickly with accept or reject,
            then turn your best idea into a concrete implementation blueprint.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-2xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />
              <h3 className="text-sm font-medium">Prompt-driven generation</h3>
            </div>
            <p className="text-sm">
              Start with domain, difficulty, and intent to get relevant idea suggestions.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCheck className="size-4" />
              <h3 className="text-sm font-medium">Accept or reject loop</h3>
            </div>
            <p className="text-sm">
              Keep refining the list by rejecting weak ideas and replacing them instantly.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers3 className="size-4" />
              <h3 className="text-sm font-medium">Structured blueprints</h3>
            </div>
            <p className="text-sm">
              Expand accepted ideas into problem, audience, features, and implementation steps.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4" />
              <h3 className="text-sm font-medium">Refinement workflow</h3>
            </div>
            <p className="text-sm">
              Give feedback and regenerate a sharper blueprint without starting over.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Save className="size-4" />
              <h3 className="text-sm font-medium">Session history</h3>
            </div>
            <p className="text-sm">
              Signed-in users can save progress and reopen previous idea sessions.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Share2 className="size-4" />
              <h3 className="text-sm font-medium">Easy sharing</h3>
            </div>
            <p className="text-sm">
              Generate share links for accepted blueprints and collaborate faster.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
