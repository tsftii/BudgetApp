import './style.css';
import { seedDefaults, dbAPI, Transaction, Category, Account } from './db.js';
import { formatCurrency, formatDate } from './utils.js';
import Chart from 'chart.js/auto';
import { scanReceipt, scanInvestmentReceipt } from './receiptScanner.js';

import { exportBackup, importBackup } from './backupManager.js';

// Setup App Shell
const appContainer = document.querySelector('#app');
if (appContainer) {
  appContainer.innerHTML = `
    <div class="header">
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <h1>Origami Wallet</h1>
        <button id="theme-toggle" style="background: var(--bg-surface); border: var(--border-width) solid var(--border-color); color: var(--text-primary); cursor: pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: var(--radius-pill); box-shadow: var(--shadow-sm); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <i class="ph-fill ph-sun" id="theme-icon" style="transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);"></i>
        </button>
      </div>
    </div>
    
    <div id="router-view" class="container">
      <!-- View content will be injected here -->
    </div>

    <nav class="bottom-nav">
      <a href="#/" class="nav-item active" data-path="/">
        <i class="ph-fill ph-house"></i>
        <span>Inicio</span>
      </a>
      <a href="#/transactions" class="nav-item" data-path="/transactions">
        <i class="ph-fill ph-list-dashes"></i>
        <span>Historial</span>
      </a>
      
      <!-- Spacer for FAB -->
      <div style="width: 64px;"></div>
      
      <button class="btn-fab" id="add-tx-btn">
        <i class="ph ph-plus" style="font-weight: bold;"></i>
      </button>
      
      <a href="#/analytics" class="nav-item" data-path="/analytics">
        <i class="ph-fill ph-chart-bar"></i>
        <span>Estadísticas</span>
      </a>
      <a href="#/accounts" class="nav-item" data-path="/accounts">
        <i class="ph-fill ph-wallet"></i>
        <span>Cuentas</span>
      </a>
    </nav>
    
    <!-- Category Modal -->
    <div class="modal-overlay" id="category-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="category-modal-title">Nueva Categoría</h2>
          <button class="modal-close" id="close-category-modal"><i class="ph ph-x"></i></button>
        </div>
        <form id="category-form">
          <input type="hidden" id="category-id" value="">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" class="form-control" id="category-name" required placeholder="Ej. Supermercado">
          </div>
          <div class="form-group flex justify-between" style="gap: 10px;">
            <div class="w-100">
              <label>Tipo</label>
              <select class="form-control" id="category-type">
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>
            <div class="w-100">
              <label>Límite Mensual</label>
              <input type="number" class="form-control" id="category-limit" required placeholder="0">
            </div>
          </div>
          <div class="form-group">
            <label>Color</label>
            <div class="color-picker" id="category-color-picker">
              <div class="color-swatch active" style="background: #f85149;" data-color="#f85149"></div>
              <div class="color-swatch" style="background: #2f81f7;" data-color="#2f81f7"></div>
              <div class="color-swatch" style="background: #238636;" data-color="#238636"></div>
              <div class="color-swatch" style="background: #d29922;" data-color="#d29922"></div>
              <div class="color-swatch" style="background: #a371f7;" data-color="#a371f7"></div>
              <div class="color-swatch" style="background: #89929b;" data-color="#89929b"></div>
            </div>
          </div>
          <div class="form-group">
            <label>Ícono</label>
            <div class="icon-picker" id="category-icon-picker">
              <div class="icon-swatch active" data-icon="ph-tag"><i class="ph ph-tag"></i></div>
              <div class="icon-swatch" data-icon="ph-house"><i class="ph ph-house"></i></div>
              <div class="icon-swatch" data-icon="ph-fork-knife"><i class="ph ph-fork-knife"></i></div>
              <div class="icon-swatch" data-icon="ph-car"><i class="ph ph-car"></i></div>
              <div class="icon-swatch" data-icon="ph-popcorn"><i class="ph ph-popcorn"></i></div>
              <div class="icon-swatch" data-icon="ph-lightning"><i class="ph ph-lightning"></i></div>
              <div class="icon-swatch" data-icon="ph-money"><i class="ph ph-money"></i></div>
              <div class="icon-swatch" data-icon="ph-shopping-cart"><i class="ph ph-shopping-cart"></i></div>
              <div class="icon-swatch" data-icon="ph-heart"><i class="ph ph-heart"></i></div>
              <div class="icon-swatch" data-icon="ph-airplane"><i class="ph ph-airplane"></i></div>
              <div class="icon-swatch" data-icon="ph-pill"><i class="ph ph-pill"></i></div>
              <div class="icon-swatch" data-icon="ph-paw-print"><i class="ph ph-paw-print"></i></div>
              <!-- 12 Nuevos Iconos -->
              <div class="icon-swatch" data-icon="ph-coffee"><i class="ph ph-coffee"></i></div>
              <div class="icon-swatch" data-icon="ph-train"><i class="ph ph-train"></i></div>
              <div class="icon-swatch" data-icon="ph-book"><i class="ph ph-book"></i></div>
              <div class="icon-swatch" data-icon="ph-game-controller"><i class="ph ph-game-controller"></i></div>
              <div class="icon-swatch" data-icon="ph-basketball"><i class="ph ph-basketball"></i></div>
              <div class="icon-swatch" data-icon="ph-music-note"><i class="ph ph-music-note"></i></div>
              <div class="icon-swatch" data-icon="ph-t-shirt"><i class="ph ph-t-shirt"></i></div>
              <div class="icon-swatch" data-icon="ph-gift"><i class="ph ph-gift"></i></div>
              <div class="icon-swatch" data-icon="ph-baby"><i class="ph ph-baby"></i></div>
              <div class="icon-swatch" data-icon="ph-wrench"><i class="ph ph-wrench"></i></div>
              <div class="icon-swatch" data-icon="ph-graduation-cap"><i class="ph ph-graduation-cap"></i></div>
              <div class="icon-swatch" data-icon="ph-bag"><i class="ph ph-bag"></i></div>
              <!-- Otros 12 Iconos -->
              <div class="icon-swatch" data-icon="ph-device-mobile"><i class="ph ph-device-mobile"></i></div>
              <div class="icon-swatch" data-icon="ph-television"><i class="ph ph-television"></i></div>
              <div class="icon-swatch" data-icon="ph-drop"><i class="ph ph-drop"></i></div>
              <div class="icon-swatch" data-icon="ph-fire"><i class="ph ph-fire"></i></div>
              <div class="icon-swatch" data-icon="ph-film-strip"><i class="ph ph-film-strip"></i></div>
              <div class="icon-swatch" data-icon="ph-bicycle"><i class="ph ph-bicycle"></i></div>
              <div class="icon-swatch" data-icon="ph-scissors"><i class="ph ph-scissors"></i></div>
              <div class="icon-swatch" data-icon="ph-bandaids"><i class="ph ph-bandaids"></i></div>
              <div class="icon-swatch" data-icon="ph-tooth"><i class="ph ph-tooth"></i></div>
              <div class="icon-swatch" data-icon="ph-hamburger"><i class="ph ph-hamburger"></i></div>
              <div class="icon-swatch" data-icon="ph-armchair"><i class="ph ph-armchair"></i></div>
              <div class="icon-swatch" data-icon="ph-plant"><i class="ph ph-plant"></i></div>
            </div>
          </div>
          <div class="flex" style="gap: 10px;">
            <button type="submit" class="btn btn-primary w-100 mt-4">Guardar Categoría</button>
            <button type="button" class="btn mt-4" id="category-delete-btn" style="display: none; background: var(--bg-elevated); border-color: var(--accent-danger); color: var(--accent-danger);">
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Modal -->
    <div class="modal-overlay" id="account-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title" id="account-modal-title">Nueva Cuenta</h2>
          <button class="modal-close" id="close-account-modal"><i class="ph ph-x"></i></button>
        </div>
        <form id="account-form">
          <input type="hidden" id="account-id" value="">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" class="form-control" id="account-name" required placeholder="Ej. Banco Galicia">
          </div>
          <div class="form-group flex justify-between" style="gap: 10px;">
            <div class="w-100">
              <label>Tipo</label>
              <select class="form-control" id="account-type">
                <option value="checking">Corriente</option>
                <option value="savings">Ahorro</option>
                <option value="cash">Efectivo</option>
                <option value="investment">Inversión</option>
              </select>
            </div>
            <div class="w-100">
              <label>Saldo Inicial</label>
              <input type="number" class="form-control" id="account-balance" required placeholder="0">
            </div>
          </div>
          <div class="flex" style="gap: 10px;">
            <button type="submit" class="btn btn-primary w-100 mt-4">Guardar Cuenta</button>
            <button type="button" class="btn mt-4" id="account-delete-btn" style="display: none; background: var(--bg-elevated); border-color: var(--accent-danger); color: var(--accent-danger);">
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div class="modal-overlay" id="tx-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Nueva Transacción</h2>
          <div style="display: flex; gap: 8px;">
            <button class="btn" type="button" id="modal-scan-btn" style="padding: 6px 12px; font-size: 0.85rem; background: var(--bg-elevated); border: 1px solid var(--border-color); color: var(--text-primary);">
              <i class="ph ph-camera"></i> Escanear
            </button>
            <button class="modal-close" type="button" id="close-tx-modal"><i class="ph ph-x"></i></button>
          </div>
        </div>
        <form id="tx-form">
          <input type="hidden" id="tx-id" value="">
          <div class="form-group flex justify-between" style="gap: 10px;">
            <div class="w-100">
              <label>Monto (ARS)</label>
              <input type="number" class="form-control" id="tx-amount" required placeholder="0" step="any">
            </div>
            <div class="w-100">
              <label>Fecha</label>
              <input type="date" class="form-control" id="tx-date" required>
            </div>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <input type="text" class="form-control" id="tx-desc" required placeholder="¿De qué fue?">
          </div>
          <div class="form-group flex justify-between" style="gap: 10px;">
            <div class="w-100">
              <label>Tipo</label>
              <select class="form-control" id="tx-type">
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div class="w-100" id="tx-category-wrapper">
              <label>Categoría</label>
              <select class="form-control" id="tx-category"></select>
            </div>
          </div>
          <div class="form-group flex justify-between" style="gap: 10px;">
            <div class="w-100">
              <label id="tx-account-label">Cuenta</label>
              <select class="form-control" id="tx-account"></select>
            </div>
            <div class="w-100" id="tx-target-account-wrapper" style="display: none;">
              <label>Cuenta Destino</label>
              <select class="form-control" id="tx-target-account"></select>
            </div>
          </div>
          <div class="flex" style="gap: 10px;">
            <button type="submit" class="btn btn-primary w-100 mt-4">Guardar Transacción</button>
            <button type="button" class="btn mt-4" id="tx-delete-btn" style="display: none; background: var(--bg-elevated); border-color: var(--accent-danger); color: var(--accent-danger);">
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Simple Router implementation
const routes: Record<string, (container: HTMLElement) => Promise<void>> = {
  '/': renderDashboard,
  '/transactions': renderTransactions,
  '/budget': renderBudget,
  '/accounts': renderAccounts,
  '/analytics': renderAnalytics,
  '/investments': renderInvestments,
};

async function renderInvestments(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <h2 style="margin: 0 0 12px 0;">Herramientas</h2>
      <button class="btn btn-primary" id="scan-investment-btn" style="padding: 10px 20px; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px; border-radius: var(--radius-pill); box-shadow: var(--shadow-sm);">
        <i class="ph ph-camera"></i> Escanear Comprobante
      </button>
    </div>
    
    <div class="form-group mb-4">
      <select class="form-control" id="inv-tool-selector" style="font-weight: 600; font-size: 1.05rem; background-color: var(--accent-primary); color: var(--bg-color); border-color: var(--border-color);">
        <option value="tradicional">Plazo Fijo Tradicional</option>
        <option value="uva">Estimador Plazo Fijo UVA</option>
        <option value="on">Calculadora de Bonos / ONs</option>
      </select>
    </div>
    
    <!-- Calculadora Plazo Fijo Tradicional -->
    <div id="tool-tradicional" class="card mb-4 inv-tool">
      <h3 style="margin-bottom: 8px; font-weight: 500;">Plazo Fijo Tradicional</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Calcula el rendimiento de tu plazo fijo o fondo común.</p>
      
      <div class="form-group">
        <label>Capital a Invertir ($)</label>
        <input type="number" class="form-control" id="inv-capital" placeholder="0.00" step="0.01">
      </div>
      <div class="form-group flex justify-between" style="gap: 10px;">
        <div class="w-100">
          <label>TNA (%)</label>
          <input type="number" class="form-control" id="inv-tna" placeholder="0.00" step="0.01">
        </div>
        <div class="w-100">
          <label>Plazo (Días)</label>
          <input type="number" class="form-control" id="inv-days" placeholder="30">
        </div>
      </div>
      
      <div style="background: var(--bg-elevated); padding: 16px; border-radius: var(--radius-md); margin-top: 16px; border: var(--border-width) solid var(--border-color); box-shadow: inset 2px 2px 0px rgba(0,0,0,0.1);">
        <div class="flex justify-between align-center mb-2">
          <span style="color: var(--text-secondary);">Interés Ganado:</span>
          <strong id="inv-interest" style="color: var(--accent-success);">+ $0.00</strong>
        </div>
        <div class="flex justify-between align-center">
          <span style="color: var(--text-secondary);">Monto Final:</span>
          <strong id="inv-total" style="font-size: 1.1rem;">$0.00</strong>
        </div>
      </div>
    </div>

    <!-- Calculadora Plazo Fijo UVA -->
    <div id="tool-uva" class="card mb-4 inv-tool" style="display: none;">
      <h3 style="margin-bottom: 8px; font-weight: 500;">Estimador Plazo Fijo UVA</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Calcula tu retorno basado en una estimación de inflación (ej. 3% mensual).</p>
      
      <div class="form-group">
        <label>Capital ($)</label>
        <input type="number" class="form-control" id="uva-capital" placeholder="0.00" step="0.01">
      </div>
      <div class="form-group flex justify-between" style="gap: 10px;">
        <div class="w-100">
          <label>Inflación Mensual Est. (%)</label>
          <input type="number" class="form-control" id="uva-inf" placeholder="3.0" step="0.1">
        </div>
        <div class="w-100">
          <label>Plazo (Días)</label>
          <input type="number" class="form-control" id="uva-days" placeholder="180">
        </div>
      </div>
      <div class="form-group">
        <label>TNA Adicional (%) <span style="font-size: 0.75rem; color: var(--text-secondary);">(Ej. 1%)</span></label>
        <input type="number" class="form-control" id="uva-tna" placeholder="1.0" step="0.1">
      </div>
      
      <div style="background: var(--bg-elevated); padding: 16px; border-radius: var(--radius-md); margin-top: 16px; border: var(--border-width) solid var(--border-color); box-shadow: inset 2px 2px 0px rgba(0,0,0,0.1);">
        <div class="flex justify-between align-center mb-2">
          <span style="color: var(--text-secondary);">Rendimiento Est.:</span>
          <strong id="uva-interest" style="color: var(--accent-success);">+ $0.00</strong>
        </div>
        <div class="flex justify-between align-center">
          <span style="color: var(--text-secondary);">Monto Final Est.:</span>
          <strong id="uva-total" style="font-size: 1.1rem;">$0.00</strong>
        </div>
      </div>
    </div>

    <!-- Calculadora Obligaciones Negociables -->
    <div id="tool-on" class="card mb-4 inv-tool" style="display: none;">
      <h3 style="margin-bottom: 8px; font-weight: 500;">Calculadora de Bonos / ONs</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Calcula el flujo anual de un bono u Obligación Negociable (simplificado).</p>
      
      <div class="form-group">
        <label>Valor Nominal a Comprar (Ej. USD)</label>
        <input type="number" class="form-control" id="on-nominal" placeholder="1000">
      </div>
      <div class="form-group flex justify-between" style="gap: 10px;">
        <div class="w-100">
          <label>Precio Compra (%)</label>
          <input type="number" class="form-control" id="on-price" placeholder="105" step="0.1">
        </div>
        <div class="w-100">
          <label>Tasa Cupón Anual (%)</label>
          <input type="number" class="form-control" id="on-coupon" placeholder="8.5" step="0.1">
        </div>
      </div>
      
      <div style="background: var(--bg-elevated); padding: 16px; border-radius: var(--radius-md); margin-top: 16px; border: var(--border-width) solid var(--border-color); box-shadow: inset 2px 2px 0px rgba(0,0,0,0.1);">
        <div class="flex justify-between align-center mb-2">
          <span style="color: var(--text-secondary);">Costo de Inversión:</span>
          <strong id="on-cost">0.00</strong>
        </div>
        <div class="flex justify-between align-center mb-2">
          <span style="color: var(--text-secondary);">Renta Anual:</span>
          <strong id="on-annual" style="color: var(--accent-success);">+ 0.00</strong>
        </div>
        <div class="flex justify-between align-center">
          <span style="color: var(--text-secondary);">Current Yield (Rend. Real):</span>
          <strong id="on-yield" style="font-size: 1.1rem;">0.00%</strong>
        </div>
      </div>
    </div>
  `;

  // Bind Tool Selector Logic
  const toolSelector = document.getElementById('inv-tool-selector') as HTMLSelectElement | null;
  if (toolSelector) {
    toolSelector.addEventListener('change', () => {
      document.querySelectorAll('.inv-tool').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      const activeTool = document.getElementById('tool-' + toolSelector.value);
      if (activeTool) activeTool.style.display = 'block';
    });
  }

  // Bind Traditional Calculator
  const bindTraditional = () => {
    const capitalEl = document.getElementById('inv-capital') as HTMLInputElement | null;
    const tnaEl = document.getElementById('inv-tna') as HTMLInputElement | null;
    const daysEl = document.getElementById('inv-days') as HTMLInputElement | null;
    const interestEl = document.getElementById('inv-interest');
    const totalEl = document.getElementById('inv-total');

    const updateCalc = () => {
      const capital = parseFloat(capitalEl?.value || '0');
      const tna = parseFloat(tnaEl?.value || '0');
      const days = parseInt(daysEl?.value || '0', 10);
      
      if (capital > 0 && tna > 0 && days > 0 && interestEl && totalEl) {
        const interest = capital * (tna / 100) * (days / 365);
        interestEl.innerText = '+ ' + formatCurrency(interest);
        totalEl.innerText = formatCurrency(capital + interest);
      } else if (interestEl && totalEl) {
        interestEl.innerText = '+ $0.00';
        totalEl.innerText = '$0.00';
      }
    };
    capitalEl?.addEventListener('input', updateCalc);
    tnaEl?.addEventListener('input', updateCalc);
    daysEl?.addEventListener('input', updateCalc);
  };

  // Bind UVA Estimator
  const bindUVA = () => {
    const capitalEl = document.getElementById('uva-capital') as HTMLInputElement | null;
    const infEl = document.getElementById('uva-inf') as HTMLInputElement | null;
    const daysEl = document.getElementById('uva-days') as HTMLInputElement | null;
    const tnaEl = document.getElementById('uva-tna') as HTMLInputElement | null;
    const interestEl = document.getElementById('uva-interest');
    const totalEl = document.getElementById('uva-total');

    const updateCalc = () => {
      const capital = parseFloat(capitalEl?.value || '0');
      const infMonthly = parseFloat(infEl?.value || '0');
      const days = parseInt(daysEl?.value || '0', 10);
      const tna = parseFloat(tnaEl?.value || '0'); // extra fixed yield
      
      if (capital > 0 && days > 0 && interestEl && totalEl) {
        const months = days / 30;
        // Compound inflation
        const totalInfMultiplier = Math.pow(1 + (infMonthly / 100), months);
        const adjustedCapital = capital * totalInfMultiplier;
        
        // Add fixed TNA
        const extraInterest = adjustedCapital * (tna / 100) * (days / 365);
        const finalTotal = adjustedCapital + extraInterest;
        const totalInterest = finalTotal - capital;

        interestEl.innerText = '+ ' + formatCurrency(totalInterest);
        totalEl.innerText = formatCurrency(finalTotal);
      } else if (interestEl && totalEl) {
        interestEl.innerText = '+ $0.00';
        totalEl.innerText = '$0.00';
      }
    };
    capitalEl?.addEventListener('input', updateCalc);
    infEl?.addEventListener('input', updateCalc);
    daysEl?.addEventListener('input', updateCalc);
    tnaEl?.addEventListener('input', updateCalc);
  };

  // Bind ON Calculator
  const bindON = () => {
    const nominalEl = document.getElementById('on-nominal') as HTMLInputElement | null;
    const priceEl = document.getElementById('on-price') as HTMLInputElement | null;
    const couponEl = document.getElementById('on-coupon') as HTMLInputElement | null;
    const costEl = document.getElementById('on-cost');
    const annualEl = document.getElementById('on-annual');
    const yieldEl = document.getElementById('on-yield');

    const updateCalc = () => {
      const nominal = parseFloat(nominalEl?.value || '0');
      const price = parseFloat(priceEl?.value || '0'); // e.g. 105 for 105% par
      const coupon = parseFloat(couponEl?.value || '0');
      
      if (nominal > 0 && price > 0 && coupon > 0 && costEl && annualEl && yieldEl) {
        const cost = nominal * (price / 100);
        const annualRenta = nominal * (coupon / 100);
        const currentYield = (annualRenta / cost) * 100;

        costEl.innerText = nominal.toLocaleString('es-AR') + ' (' + price + '%)';
        annualEl.innerText = '+ ' + annualRenta.toLocaleString('es-AR');
        yieldEl.innerText = currentYield.toFixed(2) + '%';
      } else if (costEl && annualEl && yieldEl) {
        costEl.innerText = '0.00';
        annualEl.innerText = '+ 0.00';
        yieldEl.innerText = '0.00%';
      }
    };
    nominalEl?.addEventListener('input', updateCalc);
    priceEl?.addEventListener('input', updateCalc);
    couponEl?.addEventListener('input', updateCalc);
  };

  bindTraditional();
  bindUVA();
  bindON();

  const scanInvBtn = document.getElementById('scan-investment-btn');
  const invReceiptInput = document.getElementById('investmentReceiptInput') as HTMLInputElement | null;
  if (scanInvBtn && invReceiptInput) {
    scanInvBtn.addEventListener('click', () => {
      invReceiptInput.click();
    });
  }
}

async function router(): Promise<void> {
  const path = window.location.hash.slice(1) || '/';
  const view = document.getElementById('router-view');
  if (!view) return;
  
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => {
    const navItem = el as HTMLElement;
    if (navItem.dataset.path === path) navItem.classList.add('active');
    else navItem.classList.remove('active');
  });

  const renderFn = routes[path];
  if (renderFn) {
    view.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-secondary)">Loading...</div>';
    await renderFn(view);
  } else {
    view.innerHTML = '<h2>404 Not Found</h2>';
  }
}

// Views
// Helper for tx rendering
interface TxDisplayProps {
  icon: string;
  color: string;
  title: string;
  desc: string;
  valueText: string;
  valueClass: string;
}

function getTxDisplayProps(
  tx: Transaction,
  catMap: Record<number, Category>,
  accountsMap: Record<number, Account>
): TxDisplayProps {
  if (tx.type === 'transfer') {
    const fromAcc = tx.accountId ? (accountsMap[tx.accountId]?.name || 'Desconocida') : 'Desconocida';
    const toAcc = tx.targetAccountId ? (accountsMap[tx.targetAccountId]?.name || 'Desconocida') : 'Desconocida';
    return {
      icon: 'ph-arrows-left-right',
      color: '#2f81f7',
      title: tx.description || 'Transferencia',
      desc: `${fromAcc} → ${toAcc} • ${formatDate(tx.date)}`,
      valueText: formatCurrency(tx.amount),
      valueClass: ''
    };
  }
  const cat = tx.categoryId !== undefined ? (catMap[tx.categoryId] || { name: 'Desconocida', icon: 'ph-question', color: '#888' }) : { name: 'Desconocida', icon: 'ph-question', color: '#888' };
  const isIncome = tx.type === 'income';
  return {
    icon: cat.icon || 'ph-question',
    color: cat.color || '#888',
    title: tx.description,
    desc: `${cat.name} • ${formatDate(tx.date)}`,
    valueText: `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}`,
    valueClass: isIncome ? 'text-success' : ''
  };
}

async function renderDashboard(container: HTMLElement): Promise<void> {
  const balance = await dbAPI.getTotalBalance();
  const txs = await dbAPI.getTransactions();
  const recentTxs = txs.reverse().slice(0, 5);
  const categories = await dbAPI.getCategories();
  const catMap = categories.reduce((map, c) => {
    if (c.id !== undefined) map[c.id] = c;
    return map;
  }, {} as Record<number, Category>);
  const accounts = await dbAPI.getAccounts();
  const accountsMap = accounts.reduce((map, a) => {
    if (a.id !== undefined) map[a.id] = a;
    return map;
  }, {} as Record<number, Account>);

  const expenseCatTotals: Record<number, number> = {};
  txs.forEach(tx => {
    if (tx.type === 'expense' && tx.categoryId !== undefined) {
      expenseCatTotals[tx.categoryId] = (expenseCatTotals[tx.categoryId] || 0) + tx.amount;
    }
  });
  const chartData = Object.entries(expenseCatTotals).map(([catIdStr, amount]) => {
    const catId = parseInt(catIdStr);
    const cat = catMap[catId] || { name: 'Desconocida', color: '#888' };
    return { id: catId, name: cat.name, amount, color: cat.color };
  }).sort((a, b) => b.amount - a.amount);

  container.innerHTML = `
    <div class="balance-display">
      <div class="balance-label">Balance Total</div>
      <div class="balance-amount ${balance >= 0 ? 'text-success' : 'text-danger'}">
        ${formatCurrency(balance)}
      </div>
    </div>
    
    <div class="card" style="cursor: pointer; padding-bottom: 16px;" onclick="window.location.hash='#/analytics'">
      <h3 style="font-weight: 500; margin-bottom: 16px; font-size: 1.1rem; text-align: center; margin-top: 0;">Resumen de Gastos</h3>
      <div style="height: 180px; margin-bottom: 24px; display: flex; justify-content: center;">
        ${chartData.length === 0 ? '<div style="color: var(--text-secondary); align-self: center;">No hay gastos aún</div>' : '<canvas id="dashboardChart" style="max-height: 180px; width: 100%;"></canvas>'}
      </div>
      
      ${chartData.length > 0 ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 8px;">
        ${chartData.map(d => `
          <div class="flex align-center" style="font-size: 0.9rem;">
            <div style="width: 14px; height: 14px; border-radius: 4px; background: ${d.color}; margin-right: 8px; border: 2px solid var(--border-color); flex-shrink: 0;"></div>
            <span style="color: var(--text-primary); font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${d.name}</span>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    
    <div class="card" style="cursor: pointer;" onclick="window.location.hash='#/transactions'">
      <div class="flex justify-between align-center mb-4">
        <h3 style="font-weight: 500; margin: 0;">Transacciones Recientes</h3>
        <span style="color: var(--text-secondary);"><i class="ph ph-caret-right" style="font-size: 1.2rem;"></i></span>
      </div>
      
      ${recentTxs.length === 0 ? '<div style="color: var(--text-secondary); text-align: center; padding: 20px 0;">Aún no hay transacciones. ¡Agrega una!</div>' : ''}
      
      <div class="list">
        ${recentTxs.map(tx => {
          const props = getTxDisplayProps(tx, catMap, accountsMap);
          return `
            <div class="list-item">
              <div class="flex align-center">
                <div class="list-item-icon" style="color: ${props.color}; background: ${props.color}20;">
                  <i class="ph ${props.icon}"></i>
                </div>
                <div>
                  <div class="list-item-title">${props.title}</div>
                  <div class="list-item-desc">${props.desc}</div>
                </div>
              </div>
              <div class="list-item-value ${props.valueClass}">
                ${props.valueText}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- Hub Quick Links -->
    <div class="flex" style="gap: 12px; margin-bottom: 24px;">
      <button class="btn" onclick="window.location.hash='#/budget'" style="flex: 1; padding: 12px; border-radius: var(--radius-lg); flex-direction: row; gap: 8px;">
        <div style="background: var(--accent-primary); border: var(--border-width) solid var(--border-color); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--bg-color);">
          <i class="ph-fill ph-chart-pie-slice" style="font-size: 1.25rem;"></i>
        </div>
        <span style="font-weight: 600; font-size: 0.9rem;">Presupuesto</span>
      </button>
      <button class="btn" onclick="window.location.hash='#/investments'" style="flex: 1; padding: 12px; border-radius: var(--radius-lg); flex-direction: row; gap: 8px;">
        <div style="background: var(--accent-blue); border: var(--border-width) solid var(--border-color); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--bg-color);">
          <i class="ph-bold ph-trend-up" style="font-size: 1.25rem;"></i>
        </div>
        <span style="font-weight: 600; font-size: 0.9rem;">Inversiones</span>
      </button>
    </div>
  `;

  if (chartData.length > 0) {
    const canvas = document.getElementById('dashboardChart') as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-primary').trim();
        const bgColor = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.map(d => d.name),
            datasets: [{
              data: chartData.map(d => d.amount),
              backgroundColor: chartData.map(d => d.color),
              borderWidth: 3,
              borderColor: getComputedStyle(document.body).getPropertyValue('--border-color').trim(),
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }
  }
}

async function renderTransactions(container: HTMLElement): Promise<void> {
  const txs = await dbAPI.getTransactions();
  const categories = await dbAPI.getCategories();
  const catMap = categories.reduce((map, c) => {
    if (c.id !== undefined) map[c.id] = c;
    return map;
  }, {} as Record<number, Category>);
  const accounts = await dbAPI.getAccounts();
  const accountsMap = accounts.reduce((map, a) => {
    if (a.id !== undefined) map[a.id] = a;
    return map;
  }, {} as Record<number, Account>);
  
  txs.reverse();

  // Group by date
  const groupedTxs: Record<string, Transaction[]> = {};
  txs.forEach(tx => {
    if (!groupedTxs[tx.date]) groupedTxs[tx.date] = [];
    groupedTxs[tx.date].push(tx);
  });
  
  const sortedDates = Object.keys(groupedTxs).sort((a, b) => b.localeCompare(a));
  
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  container.innerHTML = `
    <div class="header" style="padding: 16px 20px;">
      <h1 style="font-size: 1.4rem;">Historial de Transacciones</h1>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
        <button class="btn" id="btn-scan" style="padding: 6px 10px; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-color); color: var(--text-primary);" title="Escanear Ticket">
          <i class="ph-fill ph-camera"></i> Escanear
        </button>
        <button class="btn" id="btn-export-backup" style="padding: 6px 10px; font-size: 0.8rem; background: var(--accent-primary); border: 1px solid var(--border-color); color: var(--bg-color);" title="Exportar Respaldo">
          <i class="ph-fill ph-export"></i> Respaldo
        </button>
        <button class="btn" id="btn-import-backup" style="padding: 6px 10px; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-color); color: var(--text-primary);" title="Importar Respaldo">
          <i class="ph-fill ph-download-simple"></i> Restablecer
        </button>
      </div>
    </div>
    ${txs.length === 0 ? '<div class="card text-center" style="padding: 32px 16px; color: var(--text-secondary)">No se encontraron transacciones.</div>' : ''}
    <div class="list pb-4">
      ${sortedDates.map(date => {
        let displayDate = date;
        if (date === today) displayDate = 'Hoy';
        else if (date === yesterday) displayDate = 'Ayer';
        else displayDate = formatDate(date); // Fallback to formatted date

        return `
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin: 16px 0 8px 0px; text-transform: uppercase;">
            ${displayDate}
          </div>
          ${groupedTxs[date].map(tx => {
            const props = getTxDisplayProps(tx, catMap, accountsMap);
            return `
              <div class="list-item">
                <div class="flex align-center">
                  <div class="list-item-icon" style="color: ${props.color}; background: ${props.color}20;">
                    <i class="ph ${props.icon}"></i>
                  </div>
                  <div>
                    <div class="list-item-title">${props.title}</div>
                    <div class="list-item-desc">${props.desc}</div>
                  </div>
                </div>
                <div class="flex align-center">
                  <div class="list-item-value ${props.valueClass}" style="margin-right: 12px;">
                    ${props.valueText}
                  </div>
                  <button onclick="editTransaction(${tx.id})" style="background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center;">
                    <i class="ph ph-pencil-simple"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        `;
      }).join('')}
    </div>
  `;

  // Bind new buttons
  const btnScan = document.getElementById('btn-scan');
  const btnExportBackup = document.getElementById('btn-export-backup');
  const btnImportBackup = document.getElementById('btn-import-backup');
  
  if (btnScan) {
    btnScan.addEventListener('click', () => {
      const receiptInput = document.getElementById('receiptInput') as HTMLInputElement | null;
      if (receiptInput) receiptInput.click();
    });
  }

  if (btnExportBackup) {
    btnExportBackup.addEventListener('click', () => {
      const modal = document.getElementById('backup-export-modal');
      if (modal) modal.classList.add('active');
    });
  }

  if (btnImportBackup) {
    btnImportBackup.addEventListener('click', () => {
      const modal = document.getElementById('backup-import-modal');
      if (modal) modal.classList.add('active');
    });
  }
}

// Analytics and Accounts views
async function renderAccounts(container: HTMLElement): Promise<void> {
  const accounts = await dbAPI.getAccounts();
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  container.innerHTML = `
    <div class="flex justify-between align-center mb-4">
      <h2>Mis Cuentas</h2>
      <button class="btn btn-primary" id="add-account-btn" style="padding: 8px 16px; font-size: 0.9rem;">
        <i class="ph ph-plus"></i> Nueva
      </button>
    </div>
    <div class="card mb-4">
      <div style="font-size: 0.9rem; color: var(--text-secondary);">Patrimonio Total</div>
      <div style="font-size: 2rem; font-weight: 700;">${formatCurrency(total)}</div>
    </div>
    <div class="list pb-4">
      ${accounts.map(acc => `
        <div class="card" style="margin-bottom: 8px;">
          <div class="flex justify-between align-center">
            <div class="flex align-center">
              <div class="list-item-icon" style="color: #2f81f7; background: #2f81f720; width: 40px; height: 40px;">
                <i class="ph ${acc.type === 'cash' ? 'ph-money' : 'ph-bank'}"></i>
              </div>
              <span style="font-weight: 500;">${acc.name}</span>
            </div>
            <div class="flex align-center">
              <div style="font-weight: 600; font-size: 1.1rem; ${acc.balance < 0 ? 'color: var(--accent-danger)' : ''}; margin-right: 12px;">
                ${formatCurrency(acc.balance)}
              </div>
              <button onclick="editAccount(${acc.id})" style="background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center;">
                <i class="ph ph-pencil-simple"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  const addAccountBtn = document.getElementById('add-account-btn');
  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', window.openAccountModal);
  }
}

let chartInstance: Chart | null = null;
let cashflowChartInstance: Chart | null = null;
let currentAnalyticsCategory: number | null = null;

async function renderAnalytics(container: HTMLElement): Promise<void> {
  const txs = await dbAPI.getTransactions();
  const categories = await dbAPI.getCategories();
  const catMap = categories.reduce((map, c) => {
    if (c.id !== undefined) map[c.id] = c;
    return map;
  }, {} as Record<number, Category>);
  const accounts = await dbAPI.getAccounts();
  const accountsMap = accounts.reduce((map, a) => {
    if (a.id !== undefined) map[a.id] = a;
    return map;
  }, {} as Record<number, Account>);

  // Prepare detail view HTML if a category is selected
  let detailHtml = '';
  if (currentAnalyticsCategory !== null) {
    const cat = catMap[currentAnalyticsCategory] || { name: 'Desconocida', color: '#888', icon: 'ph-question' };
    const catTxs = txs.filter(tx => tx.categoryId === currentAnalyticsCategory && tx.type === 'expense').reverse();
    const totalSpent = catTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const limit = cat.budgetLimit || 0;
    
    let budgetHtml = '';
    if (limit > 0) {
      const percentage = Math.min((totalSpent / limit) * 100, 100);
      budgetHtml = `
        <div style="margin-top: 12px; padding: 12px; background: var(--bg-surface); border: var(--border-width) solid var(--border-color); border-radius: var(--radius-md); box-shadow: inset 2px 2px 0px rgba(0,0,0,0.05); cursor: pointer;" onclick="window.location.hash='#/budget'">
          <div class="flex justify-between align-center mb-2" style="font-size: 0.85rem;">
            <span style="color: var(--text-secondary); font-weight: 600;">Presupuesto: ${formatCurrency(limit)}</span>
            <span style="font-weight: bold; color: ${percentage >= 100 ? 'var(--accent-danger)' : 'var(--text-primary)'};">${percentage.toFixed(0)}%</span>
          </div>
          <div style="height: 12px; background: var(--bg-elevated); border-radius: var(--radius-pill); overflow: hidden; border: 1px solid var(--border-color);">
            <div style="height: 100%; width: ${percentage}%; background: ${percentage >= 100 ? 'var(--accent-danger)' : 'var(--accent-primary)'}; border-right: 1px solid var(--border-color);"></div>
          </div>
        </div>
      `;
    } else {
      budgetHtml = `
        <div style="margin-top: 12px; font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--bg-surface); border: var(--border-width) dashed var(--border-color); border-radius: var(--radius-md); cursor: pointer;" onclick="window.location.hash='#/budget'">
          <span>Sin presupuesto asignado</span>
          <i class="ph ph-plus" style="font-weight: bold; color: var(--text-primary); font-size: 1.1rem;"></i>
        </div>
      `;
    }

    detailHtml = `
      <div class="card mb-4" id="category-details" style="border: var(--border-width) solid ${cat.color};">
        <div class="flex align-center mb-4" style="gap: 16px;">
          <button class="btn" id="btn-analytics-back" style="padding: 8px; font-size: 1.2rem; background: var(--bg-elevated); border: var(--border-width) solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-pill); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <i class="ph ph-x"></i>
          </button>
          <div style="flex: 1;">
            <h2 style="margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
              <i class="ph-fill ${cat.icon}" style="color: ${cat.color}"></i> ${cat.name}
            </h2>
            <div style="color: var(--text-primary); font-weight: 600; font-size: 1rem; margin-top: 4px;">Gastado: ${formatCurrency(totalSpent)}</div>
          </div>
        </div>
        
        ${budgetHtml}
        
        <h4 style="margin-top: 24px; margin-bottom: 12px; font-weight: 600;">Últimas Transacciones</h4>
        
        ${catTxs.length === 0 ? '<div style="color: var(--text-secondary); text-align: center; padding: 20px 0;">No hay transacciones.</div>' : ''}
        
        <div class="list">
          ${catTxs.map(tx => {
            const props = getTxDisplayProps(tx, catMap, accountsMap);
            return `
              <div class="list-item" style="border-bottom: none; border-top: 1px solid var(--border-color);">
                <div class="flex align-center">
                  <div class="list-item-icon" style="color: ${props.color}; background: ${props.color}20;">
                    <i class="ph ${props.icon}"></i>
                  </div>
                  <div>
                    <div class="list-item-title">${props.title}</div>
                    <div class="list-item-desc">${props.desc}</div>
                  </div>
                </div>
                <div class="flex align-center">
                  <div class="list-item-value ${props.valueClass}" style="margin-right: 12px;">
                    ${props.valueText}
                  </div>
                  <button onclick="editTransaction(${tx.id})" style="background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center;">
                    <i class="ph ph-pencil-simple"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Sum expenses by category
  const expenseCatTotals: Record<number, number> = {};
  txs.forEach(tx => {
    if (tx.type === 'expense' && tx.categoryId !== undefined) {
      expenseCatTotals[tx.categoryId] = (expenseCatTotals[tx.categoryId] || 0) + tx.amount;
    }
  });

  const chartData = Object.entries(expenseCatTotals).map(([catIdStr, amount]) => {
    const catId = parseInt(catIdStr);
    const cat = catMap[catId] || { name: 'Desconocida', color: '#888' };
    return { id: catId, name: cat.name, amount, color: cat.color };
  }).sort((a, b) => b.amount - a.amount);

  // --- Cashflow Data Prep ---
  // Group by date for the last 30 days
  const today = new Date();
  today.setHours(0,0,0,0);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const dailyIncome: Record<string, number> = {};
  const dailyExpense: Record<string, number> = {};
  
  txs.forEach(tx => {
    if (tx.type === 'transfer') return;
    const txDate = new Date(tx.date);
    if (txDate >= thirtyDaysAgo) {
      const d = tx.date; // YYYY-MM-DD
      if (tx.type === 'income') {
        dailyIncome[d] = (dailyIncome[d] || 0) + tx.amount;
      } else if (tx.type === 'expense') {
        dailyExpense[d] = (dailyExpense[d] || 0) + tx.amount;
      }
    }
  });

  // Generate continuous date array for the last 30 days
  const dateLabels: string[] = [];
  const incomeSeries: number[] = [];
  const expenseSeries: number[] = [];
  const netSeriesReversed: number[] = [];
  
  let currentNet = accounts.reduce((s, a) => s + a.balance, 0);

  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = d.toISOString().split('T')[0];
    dateLabels.push(d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }));
    
    const inc = dailyIncome[dStr] || 0;
    const exp = dailyExpense[dStr] || 0;
    incomeSeries.push(inc);
    expenseSeries.push(exp);
    
    netSeriesReversed.push(currentNet);
    // Walk backwards for the cumulative net
    currentNet = currentNet - inc + exp;
  }
  
  dateLabels.reverse();
  incomeSeries.reverse();
  expenseSeries.reverse();
  const netSeries = netSeriesReversed.reverse();

  container.innerHTML = `
    <div class="flex justify-between align-center mb-4">
      <h2>Estadísticas</h2>
    </div>
    
    ${detailHtml}

    <div class="card text-center mb-4" style="${currentAnalyticsCategory !== null ? 'opacity: 0.5; pointer-events: none;' : ''}">
      <h3 style="margin-bottom: 16px; font-weight: 500;">Gastos por Categoría <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 400; display: block; margin-top: 4px;">Toca una categoría para ver detalles</span></h3>
      ${chartData.length === 0 ? '<div style="color: var(--text-secondary); padding: 20px;">No hay suficientes datos aún.</div>' : '<canvas id="expenseChart" style="max-height: 250px; width: 100%; cursor: pointer;"></canvas>'}
    </div>

    <div class="card text-center mb-4">
      <h3 style="margin-bottom: 16px; font-weight: 500;">Flujo de Caja <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 400; display: block; margin-top: 4px;">Últimos 30 días</span></h3>
      <canvas id="cashflowChart" style="max-height: 250px; width: 100%;"></canvas>
    </div>
  `;

  // Bind Back button for details
  if (currentAnalyticsCategory !== null) {
    document.getElementById('btn-analytics-back')?.addEventListener('click', () => {
      currentAnalyticsCategory = null;
      renderAnalytics(container);
    });
    // Scroll to details
    document.getElementById('category-details')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (chartData.length > 0) {
    if (chartInstance) chartInstance.destroy();
    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.map(d => d.name),
            datasets: [{
              data: chartData.map(d => d.amount),
              backgroundColor: chartData.map(d => d.color),
              borderWidth: 3,
              borderColor: getComputedStyle(document.body).getPropertyValue('--border-color').trim(),
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim() } }
            },
            onClick: (e, elements) => {
              if (elements && elements.length > 0) {
                const index = elements[0].index;
                const clickedData = chartData[index];
                if (clickedData && clickedData.id !== undefined) {
                  currentAnalyticsCategory = clickedData.id;
                  renderAnalytics(container);
                }
              }
            }
          }
        });
      }
    }
  }

  // Render Cashflow Line Chart
  if (cashflowChartInstance) cashflowChartInstance.destroy();
  const cfCanvas = document.getElementById('cashflowChart') as HTMLCanvasElement | null;
  if (cfCanvas) {
    const ctx = cfCanvas.getContext('2d');
    if (ctx) {
      cashflowChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dateLabels,
          datasets: [
            {
              label: 'Ingresos',
              data: incomeSeries,
              borderColor: '#238636',
              backgroundColor: '#23863620',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointRadius: 0,
              pointHitRadius: 10,
            },
            {
              label: 'Gastos',
              data: expenseSeries,
              borderColor: '#f85149',
              backgroundColor: '#f8514920',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointRadius: 0,
              pointHitRadius: 10,
            },
            {
              label: 'Neto',
              data: netSeries,
              borderColor: '#2f81f7',
              borderWidth: 2,
              borderDash: [5, 5],
              tension: 0.3,
              fill: false,
              pointRadius: 0,
              pointHitRadius: 10,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary').trim(), usePointStyle: true } }
          },
          scales: {
            x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim(), maxTicksLimit: 6 }, grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color').trim() } },
            y: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() }, grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color').trim() } }
          }
        }
      });
    }
  }
}

async function renderBudget(container: HTMLElement): Promise<void> {
  const categories = await dbAPI.getCategories();
  const txs = await dbAPI.getTransactions();
  
  // Calculate spent per category
  const spentByCat: Record<number, number> = {};
  txs.forEach(tx => {
    if (tx.type === 'expense' && tx.categoryId !== undefined) {
      spentByCat[tx.categoryId] = (spentByCat[tx.categoryId] || 0) + tx.amount;
    }
  });

  const expenses = categories.filter(c => c.type !== 'income');

  container.innerHTML = `
    <div class="flex justify-between align-center mb-4">
      <h2>Categorías de Presupuesto</h2>
      <button class="btn btn-primary" id="add-category-btn" style="padding: 8px 16px; font-size: 0.9rem;">
        <i class="ph ph-plus"></i> Nueva
      </button>
    </div>
    <div class="list pb-4">
      ${expenses.map(cat => {
        const spent = (cat.id !== undefined ? spentByCat[cat.id] : 0) || 0;
        const limit = cat.budgetLimit || 1; // avoid divide by 0
        const percent = Math.min(100, (spent / limit) * 100);
        
        return `
          <div class="card" style="margin-bottom: 8px;">
            <div class="flex justify-between align-center mb-4">
              <div class="flex align-center">
                <div class="list-item-icon" style="color: ${cat.color}; background: ${cat.color}20; width: 32px; height: 32px; font-size: 1rem; margin-right: 12px;">
                  <i class="ph ${cat.icon}"></i>
                </div>
                <span style="font-weight: 500;">${cat.name}</span>
              </div>
              <div class="flex align-center">
                <div style="font-weight: 600; font-size: 0.95rem; margin-right: 12px;">
                  ${formatCurrency(spent)} <span style="color: var(--text-secondary); font-weight: 400; font-size: 0.85rem">/ ${formatCurrency(cat.budgetLimit)}</span>
                </div>
                <button onclick="editCategory(${cat.id})" style="background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center;">
                  <i class="ph ph-pencil-simple"></i>
                </button>
              </div>
            </div>
            <div style="height: 6px; background: var(--bg-elevated); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${percent}%; background: ${percent > 90 ? 'var(--accent-danger)' : cat.color}; border-radius: 3px;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  const addCategoryBtn = document.getElementById('add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', window.openCategoryModal);
  }
}

// Modal Logic
const modal = document.getElementById('tx-modal');
const openModalBtn = document.getElementById('add-tx-btn');
const closeModalBtn = document.getElementById('close-tx-modal');
const txForm = document.getElementById('tx-form') as HTMLFormElement | null;

const modalScanBtn = document.getElementById('modal-scan-btn');
if (modalScanBtn) {
  modalScanBtn.addEventListener('click', () => {
    const receiptInput = document.getElementById('receiptInput') as HTMLInputElement | null;
    if (receiptInput) receiptInput.click();
  });
}

async function populateCategories(typeFilter: 'expense' | 'income' | 'transfer'): Promise<void> {
  const select = document.getElementById('tx-category') as HTMLSelectElement | null;
  if (!select) return;
  const categories = await dbAPI.getCategories();
  
  select.innerHTML = categories
    .filter(c => typeFilter === 'income' ? c.type === 'income' : c.type !== 'income')
    .map(c => `<option value="${c.id}">${c.name}</option>`)
    .join('');
}

async function populateAccounts(): Promise<void> {
  const select1 = document.getElementById('tx-account') as HTMLSelectElement | null;
  const select2 = document.getElementById('tx-target-account') as HTMLSelectElement | null;
  if (!select1 || !select2) return;
  const accounts = await dbAPI.getAccounts();
  const options = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  select1.innerHTML = options;
  select2.innerHTML = options;
}

async function handleTxTypeChange(): Promise<void> {
  const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
  if (!txTypeSelect) return;
  const type = txTypeSelect.value as 'expense' | 'income' | 'transfer';
  
  const categoryWrapper = document.getElementById('tx-category-wrapper');
  const targetAccountWrapper = document.getElementById('tx-target-account-wrapper');
  const accountLabel = document.getElementById('tx-account-label');
  
  if (type === 'transfer') {
    if (categoryWrapper) categoryWrapper.style.display = 'none';
    if (targetAccountWrapper) targetAccountWrapper.style.display = 'block';
    if (accountLabel) accountLabel.innerText = 'Cuenta Destino';
  } else {
    if (categoryWrapper) categoryWrapper.style.display = 'block';
    if (targetAccountWrapper) targetAccountWrapper.style.display = 'none';
    if (accountLabel) accountLabel.innerText = 'Cuenta';
    await populateCategories(type);
  }
}

const txTypeEl = document.getElementById('tx-type');
if (txTypeEl) {
  txTypeEl.addEventListener('change', async () => {
    await handleTxTypeChange();
  });
}

// Smart auto-detect: switch type to income when description matches income keywords
const INCOME_KEYWORDS = /\b(sueldo|salario|cobro|honorarios|freelance|alquiler cobrado|ingreso|aguinaldo|bono|premio|reintegro|devoluci[oó]n)\b/i;

async function applySmartCategory(merchant: string): Promise<void> {
  if (!merchant) return;
  const merchantLower = merchant.toLowerCase().trim();
  
  // 1. Check learned rules FIRST
  const rule = await dbAPI.getCategoryRule(merchantLower);
  if (rule) {
    const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
    if (txTypeSelect && txTypeSelect.value !== rule.type) {
      txTypeSelect.value = rule.type;
      await handleTxTypeChange(); // repopulates the category dropdown
    }
    const txCategorySelect = document.getElementById('tx-category') as HTMLSelectElement | null;
    if (txCategorySelect) txCategorySelect.value = rule.categoryId.toString();
    return;
  }

  // 2. Fallback to hardcoded logic
  const categories = await dbAPI.getCategories();
  let matchedCat: Category | undefined = undefined;

  for (const cat of categories) {
    const catName = cat.name.toLowerCase();
    if (merchantLower.includes(catName) || catName.includes(merchantLower)) {
       matchedCat = cat;
       break;
    }
  }

  if (!matchedCat) {
    const keywordMap: Record<string, RegExp> = {
      'comida': /(supermercado|coto|carrefour|dia|disco|jumbo|kiosco|mcdonalds|burger|panaderia|restaurante|cafeteria|cafe|pizza|empanadas)/,
      'transporte': /(uber|cabify|taxi|sube|tren|colectivo|estacionamiento|peaje|nafta|combustible|ypf|shell|axion)/,
      'servicios': /(edenor|edesur|metrogas|aysa|personal|movistar|claro|internet|fibertel|telecentro|luz|agua|gas)/,
      'salud': /(farmacia|hospital|clinica|osde|swiss medical|galeno)/,
      'entretenimiento': /(cine|teatro|netflix|spotify|steam|playstation|juegos)/,
      'sueldo': /(sueldo|salario|cobro|honorarios|freelance|aguinaldo|bono|premio|reintegro)/,
      'vivienda': /(alquiler|expensas|inmobiliaria|propiedad)/,
    };
    for (const cat of categories) {
      const catName = cat.name.toLowerCase();
      const pattern = keywordMap[catName];
      if (pattern && pattern.test(merchantLower)) {
        matchedCat = cat;
        break;
      }
    }
  }

  if (matchedCat && matchedCat.id !== undefined) {
    const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
    const isIncomeCat = matchedCat.type === 'income';

    if (txTypeSelect) {
      const desiredType = isIncomeCat ? 'income' : 'expense';
      if (txTypeSelect.value !== desiredType) {
        txTypeSelect.value = desiredType;
        await handleTxTypeChange();
      }
    }

    const txCategorySelect = document.getElementById('tx-category') as HTMLSelectElement | null;
    if (txCategorySelect) txCategorySelect.value = matchedCat.id.toString();
  }
}

const txDescEl = document.getElementById('tx-desc');
if (txDescEl) {
  let lastAutoType: string | null = null;
  txDescEl.addEventListener('input', async () => {
    const desc = (txDescEl as HTMLInputElement).value;
    const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
    if (!txTypeSelect) return;

    if (INCOME_KEYWORDS.test(desc)) {
      if (txTypeSelect.value !== 'income') {
        lastAutoType = txTypeSelect.value; // remember what it was
        txTypeSelect.value = 'income';
        await handleTxTypeChange();
      }
    } else if (lastAutoType !== null && txTypeSelect.value === 'income') {
      // User cleared the income keyword, revert to previous type
      txTypeSelect.value = lastAutoType;
      lastAutoType = null;
      await handleTxTypeChange();
    }
  });

  txDescEl.addEventListener('blur', async () => {
    const desc = (txDescEl as HTMLInputElement).value;
    await applySmartCategory(desc);
  });
}

if (openModalBtn && txForm && modal) {
  openModalBtn.addEventListener('click', async () => {
    const modalTitle = document.querySelector('#tx-modal .modal-title') as HTMLElement | null;
    if (modalTitle) modalTitle.innerText = 'New Transaction';
    
    const txIdInput = document.getElementById('tx-id') as HTMLInputElement | null;
    if (txIdInput) txIdInput.value = '';
    
    const deleteBtn = document.getElementById('tx-delete-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    txForm.reset();
    
    const txDateInput = document.getElementById('tx-date') as HTMLInputElement | null;
    if (txDateInput) txDateInput.value = new Date().toISOString().split('T')[0];
    
    const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
    if (txTypeSelect) txTypeSelect.value = 'expense';
    
    await populateAccounts();
    await handleTxTypeChange();
    modal.classList.add('active');
  });
}

window.editTransaction = async (id: number): Promise<void> => {
  const tx = await dbAPI.getTransaction(id);
  if (!tx) return;
  
  await populateAccounts();
  
  const modalTitle = document.querySelector('#tx-modal .modal-title') as HTMLElement | null;
  if (modalTitle) modalTitle.innerText = 'Edit Transaction';
  
  const txIdInput = document.getElementById('tx-id') as HTMLInputElement | null;
  if (txIdInput) txIdInput.value = tx.id !== undefined ? tx.id.toString() : '';
  
  const txAmountInput = document.getElementById('tx-amount') as HTMLInputElement | null;
  if (txAmountInput) txAmountInput.value = tx.amount.toString();
  
  const txDescInput = document.getElementById('tx-desc') as HTMLInputElement | null;
  if (txDescInput) txDescInput.value = tx.description;
  
  const txDateInput = document.getElementById('tx-date') as HTMLInputElement | null;
  if (txDateInput) txDateInput.value = tx.date;
  
  const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
  if (txTypeSelect) txTypeSelect.value = tx.type;
  
  await handleTxTypeChange(); // This sets category options or transfer view
  if (tx.type !== 'transfer') {
    const txCategorySelect = document.getElementById('tx-category') as HTMLSelectElement | null;
    if (txCategorySelect && tx.categoryId !== undefined) txCategorySelect.value = tx.categoryId.toString();
  } else {
    const txTargetAccountSelect = document.getElementById('tx-target-account') as HTMLSelectElement | null;
    if (txTargetAccountSelect && tx.targetAccountId !== undefined) txTargetAccountSelect.value = tx.targetAccountId.toString();
  }
  
  const txAccountSelect = document.getElementById('tx-account') as HTMLSelectElement | null;
  if (txAccountSelect) txAccountSelect.value = tx.accountId.toString();
  
  const deleteBtn = document.getElementById('tx-delete-btn');
  if (deleteBtn) deleteBtn.style.display = 'block';
  
  const txModal = document.getElementById('tx-modal');
  if (txModal) txModal.classList.add('active');
};

window.deleteTransaction = async (): Promise<void> => {
  const txIdInput = document.getElementById('tx-id') as HTMLInputElement | null;
  if (!txIdInput) return;
  const idStr = txIdInput.value;
  if (!idStr) return;
  const id = parseInt(idStr);
  
  if (confirm('Are you sure you want to delete this transaction?')) {
    await dbAPI.deleteTransaction(id);
    const txModal = document.getElementById('tx-modal');
    if (txModal) txModal.classList.remove('active');
    router();
  }
};

const txDeleteBtn = document.getElementById('tx-delete-btn');
if (txDeleteBtn) {
  txDeleteBtn.addEventListener('click', window.deleteTransaction);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    const txModal = document.getElementById('tx-modal');
    if (txModal) txModal.classList.remove('active');
  });
}

if (txForm) {
  txForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    
    const txAmountInput = document.getElementById('tx-amount') as HTMLInputElement | null;
    const txTypeSelect = document.getElementById('tx-type') as HTMLSelectElement | null;
    const txAccountSelect = document.getElementById('tx-account') as HTMLSelectElement | null;
    const txDescInput = document.getElementById('tx-desc') as HTMLInputElement | null;
    const txDateInput = document.getElementById('tx-date') as HTMLInputElement | null;
    const txIdInput = document.getElementById('tx-id') as HTMLInputElement | null;
    
    if (!txAmountInput || !txTypeSelect || !txAccountSelect || !txDescInput || !txDateInput) return;
    
    const amount = parseFloat(txAmountInput.value);
    const type = txTypeSelect.value as 'expense' | 'income' | 'transfer';
    const accountId = parseInt(txAccountSelect.value);
    
    const idStr = txIdInput ? txIdInput.value : '';
    const payload: Transaction = {
      amount: amount,
      description: txDescInput.value,
      type: type,
      accountId: accountId,
      date: txDateInput.value
    };

    if (type === 'transfer') {
      const txTargetAccountSelect = document.getElementById('tx-target-account') as HTMLSelectElement | null;
      if (txTargetAccountSelect) {
        payload.targetAccountId = parseInt(txTargetAccountSelect.value);
      }
    } else {
      const txCategorySelect = document.getElementById('tx-category') as HTMLSelectElement | null;
      if (txCategorySelect) {
        payload.categoryId = parseInt(txCategorySelect.value);
      }
    }

    if (idStr) {
      await dbAPI.updateTransaction(parseInt(idStr), payload);
    } else {
      await dbAPI.addTransaction(payload);
    }

    // Learn category mapping
    if (payload.type !== 'transfer' && payload.categoryId !== undefined && payload.description) {
      await dbAPI.learnCategoryRule(payload.description, payload.categoryId, payload.type);
    }

    txForm.reset();
    const txModal = document.getElementById('tx-modal');
    if (txModal) txModal.classList.remove('active');
    router(); // Refresh view
  });
}

// Category Modal Logic
const categoryModal = document.getElementById('category-modal');
const closeCategoryModalBtn = document.getElementById('close-category-modal');
const categoryForm = document.getElementById('category-form') as HTMLFormElement | null;

let selectedColor = '#f85149';
let selectedIcon = 'ph-tag';

function updatePickersUI(): void {
  document.querySelectorAll('#category-color-picker .color-swatch').forEach(sw => {
    const swatch = sw as HTMLElement;
    swatch.classList.toggle('active', swatch.dataset.color === selectedColor);
  });
  document.querySelectorAll('#category-icon-picker .icon-swatch').forEach(sw => {
    const swatch = sw as HTMLElement;
    swatch.classList.toggle('active', swatch.dataset.icon === selectedIcon);
  });
}

document.querySelectorAll('#category-color-picker .color-swatch').forEach(sw => {
  const swatch = sw as HTMLElement;
  swatch.addEventListener('click', () => {
    selectedColor = swatch.dataset.color || '#f85149';
    updatePickersUI();
  });
});

document.querySelectorAll('#category-icon-picker .icon-swatch').forEach(sw => {
  const swatch = sw as HTMLElement;
  swatch.addEventListener('click', () => {
    selectedIcon = swatch.dataset.icon || 'ph-tag';
    updatePickersUI();
  });
});

window.openCategoryModal = (): void => {
  const title = document.getElementById('category-modal-title');
  if (title) title.innerText = 'New Category';
  
  const categoryIdInput = document.getElementById('category-id') as HTMLInputElement | null;
  if (categoryIdInput) categoryIdInput.value = '';
  
  const deleteBtn = document.getElementById('category-delete-btn');
  if (deleteBtn) deleteBtn.style.display = 'none';
  
  if (categoryForm) categoryForm.reset();
  
  selectedColor = '#f85149';
  selectedIcon = 'ph-tag';
  updatePickersUI();
  
  const categoryTypeSelect = document.getElementById('category-type') as HTMLSelectElement | null;
  if (categoryTypeSelect) categoryTypeSelect.value = 'expense';
  
  if (categoryModal) categoryModal.classList.add('active');
};

window.editCategory = async (id: number): Promise<void> => {
  const cat = await dbAPI.getCategory(id);
  if (!cat) return;
  
  const title = document.getElementById('category-modal-title');
  if (title) title.innerText = 'Edit Category';
  
  const categoryIdInput = document.getElementById('category-id') as HTMLInputElement | null;
  if (categoryIdInput) categoryIdInput.value = cat.id !== undefined ? cat.id.toString() : '';
  
  const categoryNameInput = document.getElementById('category-name') as HTMLInputElement | null;
  if (categoryNameInput) categoryNameInput.value = cat.name;
  
  const categoryTypeSelect = document.getElementById('category-type') as HTMLSelectElement | null;
  if (categoryTypeSelect) categoryTypeSelect.value = cat.type || 'expense';
  
  const categoryLimitInput = document.getElementById('category-limit') as HTMLInputElement | null;
  if (categoryLimitInput) categoryLimitInput.value = (cat.budgetLimit || 0).toString();
  
  selectedIcon = cat.icon || 'ph-tag';
  selectedColor = cat.color || '#f85149';
  updatePickersUI();
  
  const deleteBtn = document.getElementById('category-delete-btn');
  if (deleteBtn) deleteBtn.style.display = 'block';
  
  if (categoryModal) categoryModal.classList.add('active');
};

window.deleteCategory = async (): Promise<void> => {
  const categoryIdInput = document.getElementById('category-id') as HTMLInputElement | null;
  if (!categoryIdInput) return;
  const idStr = categoryIdInput.value;
  if (!idStr) return;
  const id = parseInt(idStr);
  
  if (confirm('Are you sure you want to delete this category? (Transactions will appear as Unknown)')) {
    await dbAPI.deleteCategory(id);
    if (categoryModal) categoryModal.classList.remove('active');
    router();
  }
};

const categoryDeleteBtn = document.getElementById('category-delete-btn');
if (categoryDeleteBtn) {
  categoryDeleteBtn.addEventListener('click', window.deleteCategory);
}

if (closeCategoryModalBtn) {
  closeCategoryModalBtn.addEventListener('click', () => {
    if (categoryModal) categoryModal.classList.remove('active');
  });
}

if (categoryForm) {
  categoryForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    
    const categoryIdInput = document.getElementById('category-id') as HTMLInputElement | null;
    const idStr = categoryIdInput ? categoryIdInput.value : '';
    
    const categoryNameInput = document.getElementById('category-name') as HTMLInputElement | null;
    const categoryTypeSelect = document.getElementById('category-type') as HTMLSelectElement | null;
    const categoryLimitInput = document.getElementById('category-limit') as HTMLInputElement | null;
    
    if (!categoryNameInput || !categoryTypeSelect || !categoryLimitInput) return;
    
    const payload: Category = {
      name: categoryNameInput.value,
      type: categoryTypeSelect.value as 'expense' | 'income',
      budgetLimit: parseFloat(categoryLimitInput.value) || 0,
      icon: selectedIcon,
      color: selectedColor
    };

    if (idStr) {
      await dbAPI.updateCategory(parseInt(idStr), payload);
    } else {
      await dbAPI.addCategory(payload);
    }

    categoryForm.reset();
    if (categoryModal) categoryModal.classList.remove('active');
    router(); // Refresh view
  });
}

// Account Modal Logic
const accountModal = document.getElementById('account-modal');
const closeAccountModalBtn = document.getElementById('close-account-modal');
const accountForm = document.getElementById('account-form') as HTMLFormElement | null;

window.openAccountModal = (): void => {
  const title = document.getElementById('account-modal-title');
  if (title) title.innerText = 'New Account';
  
  const accountIdInput = document.getElementById('account-id') as HTMLInputElement | null;
  if (accountIdInput) accountIdInput.value = '';
  
  const deleteBtn = document.getElementById('account-delete-btn');
  if (deleteBtn) deleteBtn.style.display = 'none';
  
  if (accountForm) accountForm.reset();
  
  const accountTypeSelect = document.getElementById('account-type') as HTMLSelectElement | null;
  if (accountTypeSelect) accountTypeSelect.value = 'checking';
  
  if (accountModal) accountModal.classList.add('active');
};

window.editAccount = async (id: number): Promise<void> => {
  const acc = await dbAPI.getAccount(id);
  if (!acc) return;
  
  const title = document.getElementById('account-modal-title');
  if (title) title.innerText = 'Edit Account';
  
  const accountIdInput = document.getElementById('account-id') as HTMLInputElement | null;
  if (accountIdInput) accountIdInput.value = acc.id !== undefined ? acc.id.toString() : '';
  
  const accountNameInput = document.getElementById('account-name') as HTMLInputElement | null;
  if (accountNameInput) accountNameInput.value = acc.name;
  
  const accountTypeSelect = document.getElementById('account-type') as HTMLSelectElement | null;
  if (accountTypeSelect) accountTypeSelect.value = acc.type || 'checking';
  
  const accountBalanceInput = document.getElementById('account-balance') as HTMLInputElement | null;
  if (accountBalanceInput) accountBalanceInput.value = (acc.balance || 0).toString();
  
  const deleteBtn = document.getElementById('account-delete-btn');
  if (deleteBtn) deleteBtn.style.display = 'block';
  
  if (accountModal) accountModal.classList.add('active');
};

window.deleteAccount = async (): Promise<void> => {
  const accountIdInput = document.getElementById('account-id') as HTMLInputElement | null;
  if (!accountIdInput) return;
  const idStr = accountIdInput.value;
  if (!idStr) return;
  const id = parseInt(idStr);
  
  if (confirm('Are you sure you want to delete this account?')) {
    await dbAPI.deleteAccount(id);
    if (accountModal) accountModal.classList.remove('active');
    router();
  }
};

const accountDeleteBtn = document.getElementById('account-delete-btn');
if (accountDeleteBtn) {
  accountDeleteBtn.addEventListener('click', window.deleteAccount);
}

if (closeAccountModalBtn) {
  closeAccountModalBtn.addEventListener('click', () => {
    if (accountModal) accountModal.classList.remove('active');
  });
}

if (accountForm) {
  accountForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    
    const accountIdInput = document.getElementById('account-id') as HTMLInputElement | null;
    const idStr = accountIdInput ? accountIdInput.value : '';
    
    const accountNameInput = document.getElementById('account-name') as HTMLInputElement | null;
    const accountTypeSelect = document.getElementById('account-type') as HTMLSelectElement | null;
    const accountBalanceInput = document.getElementById('account-balance') as HTMLInputElement | null;
    
    if (!accountNameInput || !accountTypeSelect || !accountBalanceInput) return;
    
    const payload: Account = {
      name: accountNameInput.value,
      type: accountTypeSelect.value as 'checking' | 'savings' | 'cash' | 'investment',
      balance: parseFloat(accountBalanceInput.value) || 0,
      currency: 'ARS'
    };

    if (idStr) {
      await dbAPI.updateAccount(parseInt(idStr), payload);
    } else {
      await dbAPI.addAccount(payload);
    }

    accountForm.reset();
    if (accountModal) accountModal.classList.remove('active');
    router(); // Refresh view
  });
}

// Initialization
window.addEventListener('hashchange', router);

async function init(): Promise<void> {
  await seedDefaults();
  
  // Theme logic
  const savedTheme = localStorage.getItem('theme');
  const themeToggle = document.getElementById('theme-toggle');
  const icon = themeToggle?.querySelector('i');
  
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (icon) icon.className = 'ph ph-moon';
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const iconEl = document.getElementById('theme-icon');
      
      // Animar rotación sumando 360 grados cada vez que se toca
      if (iconEl) {
        const currentRotation = parseInt(iconEl.getAttribute('data-rotation') || '0', 10);
        const newRotation = currentRotation + 180; // Media vuelta al cambiar
        iconEl.style.transform = `rotate(${newRotation}deg)`;
        iconEl.setAttribute('data-rotation', newRotation.toString());
      }

      setTimeout(() => {
        if (isLight) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'dark');
          if (icon) icon.className = 'ph-fill ph-sun';
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('theme', 'light');
          if (icon) icon.className = 'ph-fill ph-moon';
        }
      }, 150); // Cambiar el ícono a mitad de la rotación
    });
  }

  router();

  // --- OCR Logic ---
  const receiptInput = document.getElementById('receiptInput') as HTMLInputElement | null;
  const invReceiptInput = document.getElementById('investmentReceiptInput') as HTMLInputElement | null;
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  
  if (invReceiptInput && loadingOverlay && loadingText) {
    invReceiptInput.addEventListener('change', async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files ? target.files[0] : null;
      if (!file) return;
      
      loadingText.innerText = 'Analizando Inversión...';
      loadingOverlay.classList.add('active');
      try {
        const data = await scanInvestmentReceipt(file);
        
        // Fill out the investment calculators
        const capitalEl = document.getElementById('inv-capital') as HTMLInputElement | null;
        const tnaEl = document.getElementById('inv-tna') as HTMLInputElement | null;
        const daysEl = document.getElementById('inv-days') as HTMLInputElement | null;
        
        if (data.capital) {
          if (capitalEl) capitalEl.value = data.capital.toString();
          const uvaCapitalEl = document.getElementById('uva-capital') as HTMLInputElement | null;
          if (uvaCapitalEl) { uvaCapitalEl.value = data.capital.toString(); uvaCapitalEl.dispatchEvent(new Event('input')); }
          const onNominalEl = document.getElementById('on-nominal') as HTMLInputElement | null;
          if (onNominalEl) { onNominalEl.value = data.capital.toString(); onNominalEl.dispatchEvent(new Event('input')); }
        }
        
        if (data.tna) {
          if (tnaEl) tnaEl.value = data.tna.toString();
          const uvaTnaEl = document.getElementById('uva-tna') as HTMLInputElement | null;
          if (uvaTnaEl) uvaTnaEl.value = data.tna.toString();
          const onCouponEl = document.getElementById('on-coupon') as HTMLInputElement | null;
          if (onCouponEl) onCouponEl.value = data.tna.toString();
        }
        
        if (data.days) {
          if (daysEl) daysEl.value = data.days.toString();
          const uvaDaysEl = document.getElementById('uva-days') as HTMLInputElement | null;
          if (uvaDaysEl) uvaDaysEl.value = data.days.toString();
        }
        
        // Trigger manual input event to recalculate
        if (capitalEl) capitalEl.dispatchEvent(new Event('input'));
        
      } catch (err: any) {
        alert("Fallo al leer el comprobante: " + err.message);
      } finally {
        loadingOverlay.classList.remove('active');
        loadingText.innerText = 'Procesando...';
        invReceiptInput.value = ''; // reset
      }
    });
  }

  if (receiptInput && loadingOverlay) {
    receiptInput.addEventListener('change', async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files ? target.files[0] : null;
      if (!file) return;
      
      loadingOverlay.classList.add('active');
      try {
        const data = await scanReceipt(file);
        
        // Open Add Tx modal
        const addTxBtn = document.getElementById('add-tx-btn');
        if (addTxBtn) addTxBtn.click();
        
        // Wait for modal to populate categories asynchronously
        await new Promise(r => setTimeout(r, 150));
        
        // Fill data
        const txAmountInput = document.getElementById('tx-amount') as HTMLInputElement | null;
        const txDescInput = document.getElementById('tx-desc') as HTMLInputElement | null;
        const txDateInput = document.getElementById('tx-date') as HTMLInputElement | null;
        
        if (data.amount !== null && txAmountInput) txAmountInput.value = data.amount.toString();
        if (data.merchant && txDescInput) txDescInput.value = data.merchant;
        if (data.date && txDateInput) txDateInput.value = data.date;

        // Smart Categorization
        if (data.merchant) {
           await applySmartCategory(data.merchant);
        }
        
      } catch (err: any) {
        alert("Failed to read receipt: " + err.message);
      } finally {
        loadingOverlay.classList.remove('active');
        receiptInput.value = ''; // reset
      }
    });
  }



  // --- Backup Logic ---
  const backupExportModal = document.getElementById('backup-export-modal');
  const backupImportModal = document.getElementById('backup-import-modal');
  const backupExportForm = document.getElementById('backup-export-form') as HTMLFormElement | null;
  const backupImportForm = document.getElementById('backup-import-form') as HTMLFormElement | null;
  const backupFileInput = document.getElementById('backupFileInput') as HTMLInputElement | null;

  document.getElementById('close-backup-export-modal')?.addEventListener('click', () => {
    backupExportModal?.classList.remove('active');
  });

  document.getElementById('close-backup-import-modal')?.addEventListener('click', () => {
    backupImportModal?.classList.remove('active');
  });

  if (backupExportForm) {
    backupExportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = (document.getElementById('backup-export-pwd') as HTMLInputElement).value;
      if (!pwd) return;

      try {
        if (loadingOverlay) loadingOverlay.classList.add('active');
        if (loadingText) loadingText.innerText = "Encriptando respaldo...";
        
        const blob = await exportBackup(pwd);
        
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `BudgetApp_Backup_${dateStr}.bgt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        backupExportModal?.classList.remove('active');
        backupExportForm.reset();
        alert("Respaldo exportado exitosamente.");
      } catch (err: any) {
        alert("Error al exportar: " + err.message);
      } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
      }
    });
  }

  document.getElementById('btn-select-backup')?.addEventListener('click', () => {
    backupFileInput?.click();
  });

  if (backupFileInput) {
    backupFileInput.addEventListener('change', (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      const filenameSpan = document.getElementById('backup-import-filename');
      if (file && filenameSpan) {
        filenameSpan.innerText = file.name;
      }
    });
  }

  if (backupImportForm) {
    backupImportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = (document.getElementById('backup-import-pwd') as HTMLInputElement).value;
      const file = backupFileInput?.files?.[0];
      
      if (!pwd || !file) {
        alert("Selecciona un archivo y escribe la contraseña.");
        return;
      }

      if (!confirm("ADVERTENCIA: Restaurar un respaldo sobreescribirá todos los datos actuales. ¿Estás seguro?")) {
        return;
      }

      try {
        if (loadingOverlay) loadingOverlay.classList.add('active');
        if (loadingText) loadingText.innerText = "Restaurando respaldo...";
        
        await importBackup(file, pwd);
        
        backupImportModal?.classList.remove('active');
        backupImportForm.reset();
        if (document.getElementById('backup-import-filename')) {
          document.getElementById('backup-import-filename')!.innerText = "Ningún archivo seleccionado";
        }
        
        alert("Respaldo restaurado exitosamente.");
        // Refresh app state
        window.location.hash = '#/';
        renderDashboard(document.getElementById('router-view')!);
      } catch (err: any) {
        alert("Error al restaurar: " + err.message);
      } finally {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
      }
    });
  }
}

// Call init either immediately or when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
