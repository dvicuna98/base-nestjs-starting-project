import {Module} from "@nestjs/common";
import {SharedInfrastructureModule} from "./infrastructure/shared-infrastructure.module";
import {ApplicationBootstrapOptions} from "../common/interfaces/application-bootstrap-options.interface";

@Module({
    imports:[],
    providers:[],
    // exports:[SharedInfrastructureModule]
})
export class SharedModule {
    static register (options: ApplicationBootstrapOptions){

        return {
            module:SharedModule,
            imports: [
                SharedInfrastructureModule.register(options)
            ]
        }
    }
}