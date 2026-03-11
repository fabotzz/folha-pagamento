import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>FolhaPag</h3>
          <p>Sistema de gestão de folha de pagamento</p>
        </div>
        
        <div class="footer-section">
          <h4>Links Úteis</h4>
          <ul>
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Ajuda</a></li>
            <li><a href="#">Termos de Uso</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Contato</h4>
          <p>contato@folhapag.com</p>
          <p>(11) 99999-9999</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2026 FolhaPag. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--primary-dark);
      color: white;
      margin-top: 48px;
      padding: 32px 0 0;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
      padding: 0 24px;
    }

    .footer-section {
      h3, h4 {
        margin-bottom: 16px;
        font-weight: 500;
      }

      p {
        color: rgba(255,255,255,0.8);
        line-height: 1.5;
      }

      ul {
        list-style: none;
        padding: 0;
        
        li {
          margin-bottom: 8px;
          
          a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            
            &:hover {
              color: var(--accent);
            }
          }
        }
      }
    }

    .footer-bottom {
      background-color: rgba(0,0,0,0.2);
      text-align: center;
      padding: 16px;
      margin-top: 32px;
      
      p {
        color: rgba(255,255,255,0.6);
        font-size: 14px;
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}