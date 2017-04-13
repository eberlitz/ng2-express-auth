import { AuthService } from '../../services/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TdLoadingService } from '@covalent/core';

@Component({
    selector: 'qs-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

    username: string;
    password: string;

    constructor(private _router: Router,
        private authService: AuthService,
        private _loadingService: TdLoadingService) {

    }

    login(): void {
        this._loadingService.register();
        alert('Mock log in as ' + this.username);
        setTimeout(() => {
            this._router.navigate(['/']);
            this._loadingService.resolve();
        }, 2000);
    }

    linkedinLogin() {
        this.authService.auth('linkedin');
    }
    facebookLogin() {
        this.authService.auth('facebook');
    }
    googleLogin() {
        this.authService.auth('google');
    }
}
