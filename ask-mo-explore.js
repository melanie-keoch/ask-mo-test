
    const DataTable = {
      props: ['title', 'headers', 'rows', 'totals', 'averages'],
      methods: {
        formatValue(value, format) {
          if (value == null) return '';
          switch (format) {
            case 'currency':
              return new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD',
                minimumFractionDigits: 0, maximumFractionDigits: 0
              }).format(value);
            case 'number':
              return new Intl.NumberFormat('en-US').format(value);
            case 'percent':
              return value + '%';
            default:
              return value;
          }
        },
        alignClass(align) {
          if (align === 'right') return 'text-right';
          if (align === 'center') return 'text-center';
          return 'text-left';
        }
      },
      template: `
        <div class="mt-3 bg-white/5 rounded-lg border border-white/10 overflow-hidden animate-fade-in">
          <div class="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-gray-300">{{ title }}</h4>
            <button class="text-xs text-brand-yellow hover:text-yellow-300 font-medium flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export
            </button>
          </div>
          <div class="overflow-x-auto table-scroll-wrap">
            <span class="table-scroll-hint">← Scroll to see all columns →</span>
            <table class="w-full text-sm" style="min-width:400px">
              <thead>
                <tr class="border-b border-white/10 bg-white/5">
                  <th v-for="h in headers" :key="h.value"
                      :class="[alignClass(h.align), 'px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider']">
                    {{ h.text }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in rows" :key="i"
                    class="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td v-for="h in headers" :key="h.value"
                      :class="[alignClass(h.align), 'px-4 py-2 text-gray-300']">
                    {{ formatValue(row[h.value], h.format) }}
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="totals">
                <tr class="border-t-2 border-white/10 bg-white/5 font-semibold">
                  <td v-for="(h, i) in headers" :key="h.value"
                      :class="[alignClass(h.align), 'px-4 py-2 text-gray-200']">
                    <template v-if="i === 0">Total</template>
                    <template v-else>{{ totals[h.value] != null ? formatValue(totals[h.value], h.format) : '' }}</template>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `
    };
 
    const Hero = {
      setup() {
        const { ref, reactive, onMounted, onUnmounted, nextTick } = Vue;

        const typingText = ref('');
        const messages = ref([]);
        const chatBody = ref(null);
        const timeouts = [];
        let destroyed = false;
        let heroMsgCounter = 0;

        const typingPhrases = ['clear', 'visual', 'instant', 'actionable'];

        function getCurrentTime() {
          return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }

        const conversation = [
          { type: 'user', text: "Which spaces are booked the most this month?", time: '' },
          { type: 'ai', text: "Here are your top-booked spaces for this month:\n\n\ud83c\udfdf\ufe0f Space Utilization (This Month):\n\u2022 Grand Ballroom: 24 events (92% utilized)\n\u2022 Convention Hall A: 19 events (78% utilized)\n\u2022 Rooftop Terrace: 16 events (71% utilized)\n\u2022 Board Room Suite: 28 events (68% utilized)\n\nGrand Ballroom is your highest-demand space.", time: '', hasChart: false },
          { type: 'user', text: 'Show me that as a chart', time: '' },
          { type: 'ai', text: "Here's your space utilization breakdown:", time: '', hasChart: true },
          { type: 'user', text: 'Send me a pacing report every Monday at 8 AM', time: '' },
          { type: 'ai', text: "Done! I've scheduled that report for you:", time: '', hasChore: true },
        ];

        function wait(ms) {
          return new Promise(resolve => {
            const t = setTimeout(resolve, ms);
            timeouts.push(t);
          });
        }

        // Direct DOM scroll - instant, called frequently
        function scrollToBottom() {
          if (!chatBody.value) return;
          chatBody.value.scrollTop = chatBody.value.scrollHeight;
        }

        // Direct DOM typing - bypasses Vue reactivity completely
        function typeDirect(domId, text, baseMs, varianceMs) {
          return new Promise(resolve => {
            let i = 0;
            function next() {
              if (destroyed) return resolve();
              const el = document.getElementById(domId);
              if (!el) return resolve();
              if (i >= text.length) return resolve();
              i++;
              el.textContent = text.substring(0, i);
              scrollToBottom();
              if (i >= text.length) return resolve();
              let d = baseMs + (Math.random() - 0.5) * varianceMs;
              const ch = text[i];
              if (ch === ' ') d += baseMs * 0.12;
              if (',;:'.includes(ch)) d += baseMs * 0.5;
              if ('.!?'.includes(ch)) d += baseMs * 0.8;
              d = Math.max(18, d);
              const t = setTimeout(next, d);
              timeouts.push(t);
            }
            next();
          });
        }

        // Direct DOM word streaming - bypasses Vue reactivity
        function streamDirect(domId, text, baseMs, varianceMs) {
          return new Promise(resolve => {
            const words = [];
            let cur = '';
            for (const ch of text) {
              cur += ch;
              if (ch === ' ' || ch === '\n') { words.push(cur); cur = ''; }
            }
            if (cur) words.push(cur);
            let i = 0;
            function next() {
              if (destroyed) return resolve();
              const el = document.getElementById(domId);
              if (!el) return resolve();
              if (i >= words.length) return resolve();
              i++;
              el.textContent = words.slice(0, i).join('');
              scrollToBottom();
              if (i >= words.length) return resolve();
              const word = words[i] || '';
              let d = baseMs + (Math.random() - 0.5) * varianceMs;
              if (word.includes('\n')) d += baseMs * 0.4;
              if (word.includes(':')) d += baseMs * 0.2;
              d = Math.max(15, d);
              const t = setTimeout(next, d);
              timeouts.push(t);
            }
            next();
          });
        }

        // Headline typewriter
        function startTypingAnimation() {
          let phraseIdx = 0;
          async function cycle() {
            if (destroyed) return;
            const phrase = typingPhrases[phraseIdx];
            for (let i = 1; i <= phrase.length; i++) {
              if (destroyed) return;
              typingText.value = phrase.substring(0, i);
              await wait(90 + Math.random() * 40);
            }
            await wait(2200);
            for (let i = phrase.length - 1; i >= 0; i--) {
              if (destroyed) return;
              typingText.value = phrase.substring(0, i);
              await wait(45 + Math.random() * 20);
            }
            await wait(350);
            phraseIdx = (phraseIdx + 1) % typingPhrases.length;
            cycle();
          }
          cycle();
        }

        // Chat conversation loop
        async function startConversation() {
          await wait(1800);
          while (!destroyed) {
            for (let msgIdx = 0; msgIdx < conversation.length; msgIdx++) {
              if (destroyed) return;
              const template = conversation[msgIdx];
              const msgId = 'hero-msg-' + (++heroMsgCounter);
              const msg = reactive({
                type: template.type,
                text: template.text,
                domId: msgId,
                time: getCurrentTime(),
                thinking: false,
                hasChart: template.hasChart || false,
                hasChore: template.hasChore || false,
                showChart: false,
                showChore: false,
              });

              if (msg.type === 'user') {
                messages.value.push(msg);
                await nextTick();
                scrollToBottom();
                await typeDirect(msgId, msg.text, 38, 20);
                await wait(800 + Math.random() * 400);
              } else {
                msg.thinking = true;
                messages.value.push(msg);
                await nextTick();
                scrollToBottom();
                await wait(1000 + Math.random() * 600);
                msg.thinking = false;
                await nextTick();
                scrollToBottom();
                await streamDirect(msgId, msg.text, 30, 16);
                scrollToBottom();
                if (msg.hasChart) {
                  await wait(250);
                  msg.showChart = true;
                  await nextTick();
                  scrollToBottom();
                }
                if (msg.hasChore) {
                  await wait(250);
                  msg.showChore = true;
                  await nextTick();
                  scrollToBottom();
                }
                await wait(1600 + Math.random() * 400);
              }
            }
            await wait(4000);
            messages.value = [];
          }
        }

        onMounted(() => {
          startTypingAnimation();
          startConversation();
        });

        onUnmounted(() => {
          destroyed = true;
          timeouts.forEach(t => clearTimeout(t));
        });

        return { typingText, messages, chatBody };
      },
      template: `
        <section class="relative flex items-center justify-center overflow-hidden bg-brand-navy">
          <!-- Floating background blobs -->
          <div class="absolute top-20 -left-20 w-72 h-72 bg-brand-purple/20 rounded-full blur-3xl animate-float"></div>
          <div class="absolute bottom-20 -right-20 w-96 h-96 bg-brand-violet/15 rounded-full blur-3xl animate-float-delayed"></div>
          <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl animate-float-slow"></div>

          <div class="relative z-10 max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 askmo-grid-hero gap-12 items-center">
            <!-- Left: Headlines -->
            <div>
              <div class="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <span class="w-2 h-2 bg-brand-yellow rounded-full animate-pulse"></span>
                Powered by Momentus
              </div>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Ask Mo.<br/>
                <span class="gradient-text">Get answers.</span>
              </h1>
              <p class="text-xl text-gray-300 mb-2">
                Ask the question the way you'd ask a teammate. Answers are
              </p>
              <p class="text-xl font-semibold text-brand-yellow h-8">
                {{ typingText }}<span class="cursor-blink font-light">|</span>
              </p>
              <div class="flex flex-wrap gap-4 mt-8">
                <a href="#interactive-demo" class="px-6 py-3 bg-brand-yellow text-brand-navy font-bold rounded-[10px] shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all hover:-translate-y-0.5">
                  How It Works
                </a>
                <a href="https://gomomentus.com/request-demo" target="_blank" rel="noopener" class="px-6 py-3 border border-brand-purple bg-brand-purple/20 text-white font-semibold rounded-[10px] hover:bg-brand-purple/40 transition-all">
                  Book a Demo
                </a>
              </div>
            </div>

            <!-- Right: Chat Window -->
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden max-w-md mx-auto w-full">
              <!-- Chat Header -->
              <div class="bg-white/10 border-b border-white/10 px-5 py-3 flex items-center gap-3">
                <div class="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center">
                  <span class="text-brand-navy font-bold text-sm">Mo</span>
                </div>
                <div>
                  <div class="text-white font-semibold text-sm">Ask Mo</div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span class="text-indigo-200 text-xs">Always online</span>
                  </div>
                </div>
              </div>

              <!-- Chat Body -->
              <div ref="chatBody" class="chat-body-hero overflow-y-auto p-4 space-y-4 bg-transparent">
                <div v-for="(msg, i) in messages" :key="msg.domId" class="animate-fade-in"
                     :class="msg.type === 'user' ? 'flex justify-end' : 'flex justify-start'">
                  <div class="flex gap-2 max-w-[85%]" :class="msg.type === 'user' ? 'flex-row-reverse' : ''">
                    <!-- Avatar -->
                    <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1"
                         :class="msg.type === 'user' ? 'bg-brand-navy' : 'bg-brand-yellow'">
                      <svg v-if="msg.type === 'user'" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span v-else class="text-brand-navy font-bold text-[10px]">Mo</span>
                    </div>
                    <!-- Bubble -->
                    <div>
                      <div class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                           :class="msg.type === 'user'
                             ? 'bg-brand-purple/40 text-white border border-brand-purple/30'
                             : 'bg-white/10 border border-white/10 text-gray-200'">
                        <!-- Thinking dots -->
                        <div v-show="msg.thinking" class="flex items-center gap-2 py-1">
                          <div class="flex gap-1">
                            <span class="w-2 h-2 bg-gray-400 rounded-full bounce-dot" style="animation-delay:0ms"></span>
                            <span class="w-2 h-2 bg-gray-400 rounded-full bounce-dot" style="animation-delay:150ms"></span>
                            <span class="w-2 h-2 bg-gray-400 rounded-full bounce-dot" style="animation-delay:300ms"></span>
                          </div>
                          <span class="text-xs text-gray-400">Analyzing...</span>
                        </div>
                        <!-- Message text - always in DOM, rendered via direct DOM write -->
                        <div v-show="!msg.thinking" :id="msg.domId" style="white-space: pre-line;"></div>
                      </div>

                      <!-- Bar Chart -->
                      <div v-if="msg.showChart" class="mt-2 bg-white/10 rounded-lg border border-white/10 p-3 animate-fade-in">
                        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Space Utilization This Month</div>
                        <div class="space-y-2">
                          <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-400 w-24 text-right truncate">Grand Ballroom</span>
                            <div class="flex-1 flex items-center gap-2">
                              <div class="h-6 bg-gradient-to-r from-brand-purple to-brand-violet rounded bar-grow" style="width:92%"></div>
                              <span class="text-xs font-semibold text-gray-300">92%</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-400 w-24 text-right truncate">Convention Hall A</span>
                            <div class="flex-1 flex items-center gap-2">
                              <div class="h-6 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded bar-grow" style="width:78%; animation-delay:0.15s"></div>
                              <span class="text-xs font-semibold text-gray-300">78%</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-400 w-24 text-right truncate">Rooftop Terrace</span>
                            <div class="flex-1 flex items-center gap-2">
                              <div class="h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded bar-grow" style="width:71%; animation-delay:0.3s"></div>
                              <span class="text-xs font-semibold text-gray-300">71%</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-400 w-24 text-right truncate">Board Room Suite</span>
                            <div class="flex-1 flex items-center gap-2">
                              <div class="h-6 bg-gradient-to-r from-sky-400 to-sky-500 rounded bar-grow" style="width:68%; animation-delay:0.45s"></div>
                              <span class="text-xs font-semibold text-gray-300">68%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Scheduled Report Card -->
                      <div v-if="msg.showChore" class="mt-2 bg-white/10 rounded-lg p-3 border border-white/10 animate-fade-in">
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-xs font-semibold text-gray-200">Scheduled Report</span>
                          </div>
                          <span class="text-[10px] bg-brand-yellow text-brand-navy px-2 py-0.5 rounded-full font-medium">Weekly</span>
                        </div>
                        <div class="space-y-1.5 text-xs text-gray-400">
                          <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Every Monday at 8:00 AM
                          </div>
                          <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Pacing Report: Bookings vs. Target
                          </div>
                          <div class="flex items-center gap-2">
                            <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            Email to your inbox
                          </div>
                        </div>
                      </div>

                      <div class="text-[10px] text-gray-400 mt-1" :class="msg.type === 'user' ? 'text-right' : ''">
                        {{ msg.time }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Chat Input (decorative) -->
              <div class="border-t border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2">
                <input type="text" placeholder="Ask Mo about your venue data..." disabled
                       class="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-gray-500 cursor-not-allowed border border-white/5" />
                <button disabled class="touch-target bg-brand-yellow rounded-full flex items-center justify-center opacity-50">
                  <svg class="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Scroll indicator -->
        <div class="flex justify-center py-6 bg-brand-navy">
          <div class="scroll-arrow">
            <div class="arrow-line"></div>
            <div class="arrow-chevron"></div>
            <div class="arrow-chevron-2"></div>
          </div>
        </div>
      `
    };
  
    const ProblemSolutionSection = {
      template: `
        <section id="how-it-works" class="py-24 bg-brand-navy border-t border-white/5">
          <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-16">
              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Stop hunting for reports. Just ask.</h2>
              <p class="text-lg text-gray-400 max-w-2xl mx-auto">No more exporting to Excel, building pivot tables, or waiting on IT. Ask Mo gets you answers in seconds.</p>
            </div>
            <div class="grid grid-cols-1 askmo-grid-problem gap-8">
              <!-- Old Way -->
              <div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </div>
                  <h3 class="text-xl font-bold text-red-400">The Old Way</h3>
                </div>
                <div class="space-y-4">
                  <div class="bg-black/20 rounded-lg p-4 border border-red-500/10">
                    <div class="font-mono mono-block text-xs text-red-300 bg-black/30 p-3 rounded mb-2">
                      1. Export bookings to CSV...<br/>
                      2. Open in Excel, build pivot table...<br/>
                      3. Cross-reference with space calendar...<br/>
                      4. Format charts for leadership...<br/>
                      <span class="text-red-400">Total time: 3 hours (and already outdated)</span>
                    </div>
                    <p class="text-sm text-gray-400">Export, pivot, format, repeat. Every single week.</p>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-red-400">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Manual exports and pivot tables
                  </div>
                  <div class="flex items-center gap-3 text-sm text-red-400">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Data stale by the time you share it
                  </div>
                  <div class="flex items-center gap-3 text-sm text-red-400">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Hours wasted on reporting
                  </div>
                </div>
              </div>

              <!-- New Way -->
              <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 class="text-xl font-bold text-brand-yellow">The Ask Mo Way</h3>
                </div>
                <div class="space-y-4">
                  <div class="bg-black/20 rounded-lg p-4 border border-emerald-500/10">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      </div>
                      <span class="text-sm font-medium text-gray-300">"Which spaces are booked the most?"</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center">
                        <span class="text-brand-navy font-bold text-[8px]">Mo</span>
                      </div>
                      <span class="text-sm text-emerald-400 font-medium">Grand Ballroom: 24 events, 92% utilized \u2714</span>
                    </div>
                    <p class="text-sm text-gray-400 mt-2">Ask like you would a teammate. Get instant visuals.</p>
                  </div>
                  <div class="flex items-center gap-3 text-sm text-emerald-400">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Plain language questions
                  </div>
                  <div class="flex items-center gap-3 text-sm text-emerald-400">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Interactive charts and summaries
                  </div>
                  <div class="flex items-center gap-3 text-sm text-emerald-400">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Answers in seconds, not hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `
    };
 
    const InteractiveDemo = {
      components: { DataTable },
      setup() {
        const { ref, reactive, nextTick, onUnmounted } = Vue;

        const messages = ref([]);
        const chatBody = ref(null);
        const activeQuery = ref(null);
        const timeouts = [];
        let destroyed = false;
        let demoMsgCounter = 0;

        function getCurrentTime() {
          return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }

        function wait(ms) {
          return new Promise(resolve => {
            const t = setTimeout(resolve, ms);
            timeouts.push(t);
          });
        }

        // Direct DOM scroll - instant, no animation needed during typing
        function scrollToBottom() {
          if (!chatBody.value) return;
          chatBody.value.scrollTop = chatBody.value.scrollHeight;
        }

        // Direct DOM typing - bypasses Vue reactivity for smooth char-by-char
        function typeDirect(domId, text, baseMs, varianceMs) {
          return new Promise(resolve => {
            let i = 0;
            function next() {
              if (destroyed) return resolve();
              const el = document.getElementById(domId);
              if (!el) return resolve();
              if (i >= text.length) return resolve();
              i++;
              el.textContent = text.substring(0, i);
              scrollToBottom();
              if (i >= text.length) return resolve();
              let d = baseMs + (Math.random() - 0.5) * varianceMs;
              const ch = text[i];
              if (ch === ' ') d += baseMs * 0.12;
              if (',;:'.includes(ch)) d += baseMs * 0.5;
              if ('.!?'.includes(ch)) d += baseMs * 0.8;
              d = Math.max(18, d);
              const t = setTimeout(next, d);
              timeouts.push(t);
            }
            next();
          });
        }

        // Direct DOM word streaming - bypasses Vue reactivity
        function streamDirect(domId, text, baseMs, varianceMs) {
          return new Promise(resolve => {
            const words = [];
            let cur = '';
            for (const ch of text) {
              cur += ch;
              if (ch === ' ' || ch === '\n') { words.push(cur); cur = ''; }
            }
            if (cur) words.push(cur);
            let i = 0;
            function next() {
              if (destroyed) return resolve();
              const el = document.getElementById(domId);
              if (!el) return resolve();
              if (i >= words.length) return resolve();
              i++;
              el.textContent = words.slice(0, i).join('');
              scrollToBottom();
              if (i >= words.length) return resolve();
              const word = words[i] || '';
              let d = baseMs + (Math.random() - 0.5) * varianceMs;
              if (word.includes('\n')) d += baseMs * 0.4;
              if (word.includes(':')) d += baseMs * 0.2;
              d = Math.max(15, d);
              const t = setTimeout(next, d);
              timeouts.push(t);
            }
            next();
          });
        }

        const queries = [
          {
            title: 'Space Demand',
            icon: 'chart',
            query: "Which spaces are booked the most this quarter?",
            type: 'spaces',
            response: {
              text: "Your top 5 most-booked spaces this quarter, ranked by total events and utilization rate:",
              tableData: {
                title: 'Space Utilization - This Quarter',
                headers: [
                  { text: 'Space', value: 'space' },
                  { text: 'Events', value: 'events', align: 'right', format: 'number' },
                  { text: 'Utilization', value: 'utilization', align: 'right', format: 'percent' },
                  { text: 'Revenue', value: 'revenue', align: 'right', format: 'currency' },
                ],
                rows: [
                  { space: 'Grand Ballroom', events: 72, utilization: 94, revenue: 864000 },
                  { space: 'Convention Hall A', events: 58, utilization: 82, revenue: 522000 },
                  { space: 'Rooftop Terrace', events: 45, utilization: 76, revenue: 405000 },
                  { space: 'Executive Board Room', events: 89, utilization: 71, revenue: 178000 },
                  { space: 'Garden Pavilion', events: 34, utilization: 65, revenue: 306000 },
                ],
                totals: { events: 298, revenue: 2275000 }
              }
            },
            followUpQuestions: [
              {
                text: "Why is the Rooftop Terrace underperforming?",
                query: "Why is the Rooftop Terrace underperforming compared to the Grand Ballroom?",
                response: {
                  text: "The Rooftop Terrace had 12 weather-related cancellations this quarter and 8 days blocked for maintenance. Without those disruptions, projected utilization would have been 89%. Consider offering indoor backup options to reduce weather cancellations.",
                  tableData: null
                }
              },
              {
                text: "Show me availability for next month",
                query: "Show open availability for the Grand Ballroom next month",
                response: {
                  text: "The Grand Ballroom has 4 open dates next month. Two are weekday slots and two are prime weekend evenings:",
                  tableData: {
                    title: 'Grand Ballroom - Open Dates Next Month',
                    headers: [
                      { text: 'Date', value: 'date' },
                      { text: 'Day', value: 'day' },
                      { text: 'Time Slot', value: 'slot' },
                      { text: 'Demand', value: 'demand' },
                    ],
                    rows: [
                      { date: 'Mar 5', day: 'Wednesday', slot: 'Full Day', demand: '\ud83d\udfe1 Moderate' },
                      { date: 'Mar 11', day: 'Tuesday', slot: 'Evening', demand: '\ud83d\udfe2 Low' },
                      { date: 'Mar 22', day: 'Saturday', slot: 'Evening', demand: '\ud83d\udd34 High' },
                      { date: 'Mar 29', day: 'Saturday', slot: 'Full Day', demand: '\ud83d\udd34 High' },
                    ],
                    totals: null
                  }
                }
              }
            ]
          },
          {
            title: 'Booking Pipeline',
            icon: 'calendar',
            query: "How are we pacing against our booking targets?",
            type: 'pipeline',
            response: {
              text: "You are 8% ahead of target for Q1. Event opportunities in the pipeline total $1.8M. Here is the breakdown by stage:",
              tableData: {
                title: 'Booking Pipeline - Q1',
                headers: [
                  { text: 'Stage', value: 'stage' },
                  { text: 'Opportunities', value: 'count', align: 'right', format: 'number' },
                  { text: 'Value', value: 'value', align: 'right', format: 'currency' },
                  { text: 'Win Rate', value: 'winRate', align: 'right', format: 'percent' },
                ],
                rows: [
                  { stage: 'Inquiry', count: 34, value: 612000, winRate: 25 },
                  { stage: 'Proposal Sent', count: 18, value: 486000, winRate: 55 },
                  { stage: 'Contract Pending', count: 12, value: 420000, winRate: 85 },
                  { stage: 'Confirmed', count: 22, value: 308000, winRate: 100 },
                ],
                totals: { count: 86, value: 1826000 }
              }
            },
            followUpQuestions: [
              {
                text: "Which proposals are at risk of expiring?",
                query: "Which proposals are at risk of expiring this week?",
                response: {
                  text: "3 proposals are expiring within the next 7 days, totaling $142,000 in potential revenue:\n\n\u2022 Meridian Corp Gala - Expires in 2 days ($68,000)\n\u2022 Tech Summit 2025 - Expires in 4 days ($52,000)\n\u2022 Alumni Reunion Dinner - Expires in 6 days ($22,000)\n\nI recommend following up with Meridian Corp first, as it has the highest value.",
                  tableData: null
                }
              },
              {
                text: "Compare pacing to last year",
                query: "Compare our booking pace to the same period last year",
                response: {
                  text: "You are pacing 12% ahead of the same period last year. Confirmed bookings are up $185K, and average deal size has increased from $14,200 to $16,800. The biggest growth is in corporate events (+22%), while social events are flat.",
                  tableData: null
                }
              }
            ]
          },
          {
            title: 'Event Operations',
            icon: 'clipboard',
            query: "What service orders are still outstanding for this week?",
            type: 'operations',
            response: {
              text: "There are 14 outstanding service orders across 6 events this week. 3 are flagged as urgent:",
              tableData: {
                title: 'Outstanding Service Orders - This Week',
                headers: [
                  { text: 'Event', value: 'event' },
                  { text: 'Service', value: 'service' },
                  { text: 'Due', value: 'due' },
                  { text: 'Status', value: 'status' },
                ],
                rows: [
                  { event: 'Meridian Corp Gala', service: 'AV Setup (Full Stage)', due: 'Tomorrow', status: '\ud83d\udd34 Urgent' },
                  { event: 'Meridian Corp Gala', service: 'Catering (250 guests)', due: 'Tomorrow', status: '\ud83d\udd34 Urgent' },
                  { event: 'Tech Summit Day 1', service: 'WiFi Upgrade (500 users)', due: 'Wed', status: '\ud83d\udd34 Urgent' },
                  { event: 'Board Meeting', service: 'Room Config (U-shape)', due: 'Thu', status: '\ud83d\udfe1 Pending' },
                  { event: 'Wedding Reception', service: 'Floral Arrangements', due: 'Fri', status: '\ud83d\udfe1 Pending' },
                  { event: 'Wedding Reception', service: 'Lighting Package', due: 'Fri', status: '\ud83d\udfe2 On Track' },
                ],
                totals: null
              }
            },
            followUpQuestions: [
              {
                text: "Details on the Meridian Corp Gala",
                query: "Give me the full details on the Meridian Corp Gala setup",
                response: {
                  text: "Meridian Corp Gala - Grand Ballroom, Tomorrow 6:00 PM\n\n\u2022 Guest Count: 250 (confirmed)\n\u2022 Setup: Banquet rounds with stage and dance floor\n\u2022 AV: Full stage with 2 screens, wireless mics, house sound\n\u2022 Catering: 3-course plated dinner + cocktail hour\n\u2022 Bar: Premium open bar, 6 hours\n\u2022 Parking: Valet arranged for 80 vehicles\n\u2022 Event Manager: Sarah Chen (on-site from 3 PM)\n\nAll vendors confirmed except the florist, who is pending delivery time.",
                  tableData: null
                }
              },
              {
                text: "Flag the WiFi upgrade as critical",
                query: "Flag the Tech Summit WiFi upgrade as critical and notify the ops team",
                response: {
                  text: "\u2705 Done! The WiFi Upgrade for Tech Summit has been escalated to critical priority. The operations team has been notified via email and the task is now pinned at the top of the daily ops board.",
                  tableData: null
                }
              }
            ]
          }
        ];

        const processingMessages = {
          spaces: ['Processing your request...', 'Querying space data...', 'Analyzing utilization rates...', 'Calculating revenue metrics...', 'Formatting results...'],
          pipeline: ['Processing your request...', 'Querying event opportunities...', 'Analyzing pipeline stages...', 'Calculating win rates...', 'Formatting results...'],
          operations: ['Processing your request...', 'Querying service orders...', 'Checking event schedules...', 'Flagging urgent items...', 'Formatting results...'],
          default: ['Processing your request...', 'Querying Momentus data...', 'Analyzing results...', 'Formatting response...'],
        };

        async function handleQuery(queryObj, type) {
          if (activeQuery.value) return;
          activeQuery.value = true;

          const userMsgId = 'demo-msg-' + (++demoMsgCounter);
          const userMsg = reactive({ type: 'user', text: queryObj.query, domId: userMsgId, time: getCurrentTime() });
          messages.value.push(userMsg);
          await nextTick();
          scrollToBottom();
          await typeDirect(userMsgId, queryObj.query, 35, 18);
          await wait(500 + Math.random() * 300);

          const aiMsgId = 'demo-msg-' + (++demoMsgCounter);
          const processingMsgs = processingMessages[type] || processingMessages.default;
          const aiMsg = reactive({
            type: 'ai', domId: aiMsgId, time: '', thinking: true,
            processingMessage: processingMsgs[0],
            response: queryObj.response,
            showResponse: false,
            followUps: queryObj.followUpQuestions || [],
            showFollowUps: false,
            responseTime: '',
          });
          messages.value.push(aiMsg);
          await nextTick();
          scrollToBottom();

          // Cycle processing messages
          let pmIdx = 0;
          let pmRunning = true;
          function cycleProcessing() {
            if (!pmRunning || destroyed) return;
            pmIdx = (pmIdx + 1) % processingMsgs.length;
            aiMsg.processingMessage = processingMsgs[pmIdx];
            const t = setTimeout(cycleProcessing, 500);
            timeouts.push(t);
          }
          const pmStart = setTimeout(cycleProcessing, 500);
          timeouts.push(pmStart);

          const processingTime = 2200 + Math.random() * 800;
          await wait(processingTime);
          pmRunning = false;

          aiMsg.thinking = false;
          aiMsg.showResponse = true;
          aiMsg.time = getCurrentTime();
          aiMsg.responseTime = (processingTime / 1000).toFixed(1);
          await nextTick();
          scrollToBottom();

          // Stream the AI response word by word via direct DOM
          await streamDirect(aiMsgId, queryObj.response.text, 30, 16);
          scrollToBottom();

          // Scroll again after table renders (if present)
          if (queryObj.response.tableData) {
            await nextTick();
            scrollToBottom();
            await wait(200);
            scrollToBottom();
            await wait(300);
            scrollToBottom();
          }

          if (aiMsg.followUps.length > 0) {
            await wait(600 + Math.random() * 300);
            aiMsg.showFollowUps = true;
            await nextTick();
            scrollToBottom();
            await wait(100);
            scrollToBottom();
          }

          activeQuery.value = false;
        }

        function handleTileClick(query) {
          messages.value = [];
          handleQuery(query, query.type);
        }

        function handleFollowUp(followUp, parentType) {
          handleQuery(followUp, parentType || 'default');
        }

        onUnmounted(() => {
          destroyed = true;
          timeouts.forEach(t => clearTimeout(t));
        });

        return { messages, chatBody, queries, activeQuery, handleTileClick, handleFollowUp };
      },
      template: `
        <section id="interactive-demo" class="py-24 bg-brand-navy border-t border-white/5">
          <div class="max-w-5xl mx-auto px-6">
            <div class="text-center mb-12">
              <div class="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Interactive Demo
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Try it yourself</h2>
              <p class="text-lg text-gray-400">Click a scenario below and watch Mo respond in real time.</p>
            </div>

            <!-- Query Tiles -->
            <div class="grid grid-cols-1 askmo-grid-query-tiles gap-4 mb-8">
              <button v-for="q in queries" :key="q.title"
                      @click="handleTileClick(q)"
                      :disabled="activeQuery"
                      class="group text-left p-5 bg-white/5 border border-white/10 rounded-xl hover:border-brand-purple/50 hover:bg-white/10 hover:shadow-lg hover:shadow-brand-purple/10 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                       :class="q.type === 'spaces' ? 'bg-brand-purple/20' : q.type === 'pipeline' ? 'bg-brand-yellow/20' : 'bg-emerald-500/20'">
                    <svg v-if="q.type === 'spaces'" class="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    <svg v-else-if="q.type === 'pipeline'" class="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    <svg v-else class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                  </div>
                  <h3 class="font-semibold text-gray-200 group-hover:text-brand-yellow transition-colors">{{ q.title }}</h3>
                </div>
                <p class="text-sm text-gray-400 italic">"{{ q.query }}"</p>
              </button>
            </div>

            <!-- Chat Window -->
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden">
              <div class="bg-white/10 border-b border-white/10 px-5 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center">
                    <span class="text-brand-navy font-bold text-sm">Mo</span>
                  </div>
                  <div>
                    <div class="text-white font-semibold text-sm">Ask Mo</div>
                    <div class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      <span class="text-indigo-200 text-xs">Interactive Demo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div ref="chatBody" class="chat-body-demo overflow-y-auto p-5 space-y-4 bg-transparent">
                <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg class="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  <p class="text-sm">Click a scenario above to start</p>
                </div>

                <div v-for="(msg, i) in messages" :key="msg.domId" class="animate-fade-in"
                     :class="msg.type === 'user' ? 'flex justify-end' : 'flex justify-start'">
                  <div class="flex gap-2 max-w-[88%]" :class="msg.type === 'user' ? 'flex-row-reverse' : ''">
                    <div class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1"
                         :class="msg.type === 'user' ? 'bg-brand-navy' : 'bg-brand-yellow'">
                      <svg v-if="msg.type === 'user'" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      <span v-else class="text-brand-navy font-bold text-[10px]">Mo</span>
                    </div>
                    <div class="flex-1">
                      <div class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                           :class="msg.type === 'user'
                             ? 'bg-brand-purple/40 text-white border border-brand-purple/30'
                             : 'bg-white/10 border border-white/10 text-gray-200'">
                        <div v-show="msg.thinking" class="flex items-center gap-2 py-1">
                          <div class="flex gap-1">
                            <span class="w-2 h-2 bg-gray-400 rounded-full bounce-dot" style="animation-delay:0ms"></span>
                            <span class="w-2 h-2 bg-gray-400 rounded-full bounce-dot" style="animation-delay:150ms"></span>
                            <span class="w-2 h-2 bg-gray-400 rounded-full bounce-dot" style="animation-delay:300ms"></span>
                          </div>
                          <span class="text-xs text-gray-400">{{ msg.processingMessage }}</span>
                        </div>
                        <div v-show="!msg.thinking" :id="msg.domId" style="white-space: pre-line;"></div>
                      </div>

                      <data-table
                        v-if="msg.showResponse && msg.response && msg.response.tableData"
                        :title="msg.response.tableData.title"
                        :headers="msg.response.tableData.headers"
                        :rows="msg.response.tableData.rows"
                        :totals="msg.response.tableData.totals"
                      />

                      <div v-if="msg.responseTime" class="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        Responded in {{ msg.responseTime }}s
                      </div>

                      <div v-if="msg.showFollowUps && msg.followUps.length > 0" class="mt-3 flex flex-wrap gap-2 animate-fade-in">
                        <button v-for="(fu, fi) in msg.followUps" :key="fi"
                                @click="handleFollowUp(fu, msg.response?.type)"
                                :disabled="activeQuery"
                                class="text-xs px-3 py-1.5 bg-brand-purple/20 text-gray-200 border border-brand-purple/30 rounded-full hover:bg-brand-purple/30 hover:border-brand-purple/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {{ fu.text }}
                        </button>
                      </div>

                      <div v-if="msg.time" class="text-[10px] text-gray-500 mt-1" :class="msg.type === 'user' ? 'text-right' : ''">
                        {{ msg.time }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-t border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2">
                <input type="text" placeholder="Ask Mo about your venue data..." disabled
                       class="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-gray-500 cursor-not-allowed border border-white/5" />
                <button disabled class="touch-target bg-brand-yellow rounded-full flex items-center justify-center opacity-50">
                  <svg class="w-4 h-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      `
    };
 
    const HandOffToAI = {
      template: `
        <section class="py-24 bg-brand-navy border-t border-white/5 overflow-hidden">
          <div class="max-w-6xl mx-auto px-6">
            <div class="text-center mb-16">
              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Three steps. Instant clarity.</h2>
              <p class="text-lg text-gray-400">Self-serve reporting built right into Momentus Enterprise.</p>
            </div>

            <div class="grid grid-cols-1 askmo-grid-handoff gap-8 relative">
              <svg class="hidden md:block absolute top-16 left-0 w-full h-4 z-0" preserveAspectRatio="none">
                <line x1="22%" y1="8" x2="46%" y2="8" stroke="rgba(255,255,255,0.15)" stroke-width="2" class="dashed-line"/>
                <line x1="54%" y1="8" x2="78%" y2="8" stroke="rgba(255,255,255,0.15)" stroke-width="2" class="dashed-line"/>
              </svg>

              <!-- Ask -->
              <div class="relative z-10 text-center">
                <div class="mx-auto w-20 h-20 bg-brand-yellow rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
                  <svg class="w-10 h-10 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
                <h3 class="text-lg font-bold text-white mb-3">Ask</h3>
                <ul class="text-sm text-gray-400 space-y-2">
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-brand-purple rounded-full"></span>
                    Plain language questions
                  </li>
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-brand-purple rounded-full"></span>
                    No reporting expertise needed
                  </li>
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-brand-purple rounded-full"></span>
                    Ask like you would a teammate
                  </li>
                </ul>
              </div>

              <!-- Get Answers -->
              <div class="relative z-10 text-center">
                <div class="relative mx-auto w-20 h-20 mb-6">
                  <div class="absolute inset-0 rounded-2xl border-2 border-dashed border-white/20 animate-spin-slow"></div>
                  <div class="absolute inset-1 rounded-xl border-2 border-dashed border-brand-violet/30 animate-spin-reverse"></div>
                  <div class="absolute inset-0 w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-violet rounded-2xl flex items-center justify-center shadow-lg shadow-brand-purple/30">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                </div>
                <h3 class="text-lg font-bold text-white mb-3">Get Answers Fast</h3>
                <ul class="text-sm text-gray-400 space-y-2">
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-brand-violet rounded-full animate-pulse"></span>
                    Results in seconds
                  </li>
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-brand-violet rounded-full animate-pulse" style="animation-delay:0.3s"></span>
                    Interactive visualizations
                  </li>
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-brand-violet rounded-full animate-pulse" style="animation-delay:0.6s"></span>
                    Written summaries included
                  </li>
                </ul>
              </div>

              <!-- Explore & Share -->
              <div class="relative z-10 text-center">
                <div class="mx-auto w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                  <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                </div>
                <h3 class="text-lg font-bold text-white mb-3">Explore &amp; Share</h3>
                <ul class="text-sm text-gray-400 space-y-2">
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    Filter and drill into charts
                  </li>
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    Download for presentations
                  </li>
                  <li class="flex items-center justify-center gap-2">
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    Copy summaries for emails
                  </li>
                </ul>
              </div>
            </div>

            <!-- Venue Types -->
            <div class="mt-20 text-center">
              <p class="text-sm text-gray-500 uppercase tracking-wider font-medium mb-6">Built for every venue type</p>
              <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                <a href="https://gomomentus.com/convention-center-event-software" target="_blank" rel="noopener" class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all">
                  <svg class="w-4 h-4 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  Convention Centers
                </a>
                <a href="https://gomomentus.com/stadium-arena-event-software" target="_blank" rel="noopener" class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all">
                  <svg class="w-4 h-4 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
                  Stadiums &amp; Arenas
                </a>
                <a href="https://gomomentus.com/performing-arts-center-event-software" target="_blank" rel="noopener" class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all">
                  <svg class="w-4 h-4 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0h3a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3"/></svg>
                  Performing Arts
                </a>
                <a href="https://gomomentus.com/university-campus-event-software" target="_blank" rel="noopener" class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all">
                  <svg class="w-4 h-4 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  Universities
                </a>
                <a href="https://gomomentus.com/corporate-campus-event-software" target="_blank" rel="noopener" class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all">
                  <svg class="w-4 h-4 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Corporate Campuses
                </a>
                <a href="https://gomomentus.com/conference-center-event-software" target="_blank" rel="noopener" class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all">
                  <svg class="w-4 h-4 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Conference Centers
                </a>
                <a href="https://gomomentus.com/more-solutions" target="_blank" rel="noopener" class="flex items-center gap-2 bg-brand-purple/10 border border-brand-purple/30 px-4 py-2 rounded-full text-brand-violet hover:bg-brand-purple/20 hover:text-white transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>
                  And More
                </a>
              </div>
            </div>
          </div>
        </section>
      `
    };
  
    const { createApp } = Vue;

    const App = {
      components: { Hero, ProblemSolutionSection, InteractiveDemo, HandOffToAI },
      template: `
        <div>
          <Hero />
          <ProblemSolutionSection />
          <InteractiveDemo />
          <HandOffToAI />

          <!-- Final CTA Section -->
          <section id="book-demo" class="py-24 bg-brand-navy border-t border-white/5 relative overflow-hidden">
            <!-- Background glow -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl"></div>
            </div>
            <div class="relative z-10 max-w-2xl mx-auto px-6 text-center">
              <div class="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <span class="w-2 h-2 bg-brand-yellow rounded-full animate-pulse"></span>
                Get Started
              </div>
              <h2 class="text-3xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
                Ready to ask your<br/><span class="gradient-text">first question?</span>
              </h2>
              <p class="text-lg text-gray-400 mb-10 max-w-xl mx-auto">See how Ask Mo transforms reporting for your venue. Book a personalized demo with our team.</p>
              <a href="https://gomomentus.com/request-demo" target="_blank" rel="noopener"
                 class="inline-flex items-center gap-2 px-8 py-4 bg-brand-yellow text-brand-navy font-bold text-lg rounded-[10px] shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all hover:-translate-y-1">
                Book a Demo
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
            </div>
          </section>


        </div>
      `
    };

    createApp(App).mount('#askmo-app');
