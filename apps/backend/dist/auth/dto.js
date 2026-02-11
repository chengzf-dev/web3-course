"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMeResponse = exports.AuthVerifyResponse = exports.AuthChallengeResponse = exports.AuthVerifyDto = exports.AuthChallengeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AuthChallengeDto {
}
exports.AuthChallengeDto = AuthChallengeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], AuthChallengeDto.prototype, "address", void 0);
class AuthVerifyDto {
}
exports.AuthVerifyDto = AuthVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEthereumAddress)(),
    __metadata("design:type", String)
], AuthVerifyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthVerifyDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuthVerifyDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(8, 128),
    __metadata("design:type", String)
], AuthVerifyDto.prototype, "nonce", void 0);
class AuthChallengeResponse {
}
exports.AuthChallengeResponse = AuthChallengeResponse;
class AuthVerifyResponse {
}
exports.AuthVerifyResponse = AuthVerifyResponse;
class AuthMeResponse {
}
exports.AuthMeResponse = AuthMeResponse;
//# sourceMappingURL=dto.js.map