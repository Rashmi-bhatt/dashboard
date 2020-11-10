import React, { Component } from 'react'
import { getSuggestedCommands } from './command.util';
import { ReactComponent as Arrow } from '../../assets/icons/ic-chevron-down.svg';
import './command.css';
interface CommandProps {
    defaultArguments: { label: string; value: string; }[];
    isTabMode: boolean;
}
interface CommandState {
    argumentInput: string;
    arguments: { value: string }[];
    options: { label: string; argument: string }[];
    suggestedCommands: any[],
    tab: 'jump-to' | 'this-app';
    showCommandBar: boolean;
}
export class Command extends Component<any, CommandState>  {

    constructor(props) {
        super(props);
        this.state = {
            argumentInput: '',
            arguments: this.props.defaultArguments || [],
            options: [
                { label: 'Applications', argument: 'app' },
                { label: 'Helm Charts', argument: 'chart' },
                { label: 'Documentation', argument: 'docs' },
                { label: 'Deployment Group', argument: 'deployment-group' },
                { label: 'Security', argument: 'security' },
                { label: 'Global Configuration', argument: 'global-config' },
            ],
            suggestedCommands: [],
            tab: 'jump-to',
            showCommandBar: false,
        }
        this.selectOption = this.selectOption.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.invoke = this.invoke.bind(this);
        this.handleArgumentInputChange = this.handleArgumentInputChange.bind(this);
        this.selectSuggestedCommand = this.selectSuggestedCommand.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.invoke);
        let suggestedCommands = getSuggestedCommands(this.state.arguments);
        this.setState({ suggestedCommands });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.invoke);
    }

    selectOption(option: { label: string; argument: string; }): void {
        this.setState({ arguments: [{ value: option.argument }, { value: "/" }] });
    }

    selectSuggestedCommand(cmd): void {
        this.setState({ arguments: cmd.arguments });
    }

    selectTab(event): void {
        this.setState({ tab: event.target.value });
    }

    invoke(event) {
        if (event.metaKey && event.key === '/') {
            this.setState({ showCommandBar: true });
        }
        else if (event.key === "Escape") {
            this.setState({ showCommandBar: false });
        }
        else if ((event.key === 'Enter' || event.key === '/') && this.state.argumentInput.length) {
            let newArguments = [
                { value: this.state.argumentInput, argument: '' },
                { value: '/', argument: '' }
            ];
            let allArgs = this.state.arguments.concat(newArguments);
            let suggestedCommands = getSuggestedCommands(allArgs);
            this.setState({ arguments: allArgs, suggestedCommands, argumentInput: '' });
        }
        else if (event.key === 'Backspace' && !this.state.argumentInput.length) {
            let allArgs = this.state.arguments;
            let start = this.state.arguments.length - 2;
            allArgs.splice(start, 2);
            let suggestedCommands = getSuggestedCommands(allArgs);
            this.setState({ arguments: allArgs, suggestedCommands, argumentInput: '' });
        }
    }

    handleArgumentInputChange(event) {
        if (event.target.value === "/") {
            this.setState({ argumentInput: '' });
        }
        else {
            this.setState({ argumentInput: event.target.value });
        }
    }

    render() {
        if (this.state.showCommandBar) {
            return <div className="transparent-div" onClick={() => this.setState({ showCommandBar: false })}>
                <div className="command" onClick={(event) => event.stopPropagation()}>
                    {this.props.isTabMode ? <div>
                        <label>
                            <input type="radio" name="command-tab" value="this-app" onChange={this.selectTab} />This App
                        </label>
                        <label>
                            <input type="radio" name="command-tab" value="jump-to" onChange={this.selectTab} />Jump To
                        </label>
                    </div> : null}
                    <div className="command-arg">
                        {this.state.arguments.map((arg, index) => {
                            return <span key={`${index}-${arg.value}`} className={arg.value !== "/" ? "command-arg__arg m-4" : "ml-4 mr-4"}>{arg.value}</span>
                        })}
                        <input type="text" value={this.state.argumentInput} autoFocus className="m-4 flex-1"
                            placeholder="Search for anything accross devtron" onChange={this.handleArgumentInputChange} />
                    </div>
                    <div className="p-8">
                        <p className="mt-18 mb-8">I'm looking for...</p>
                        <p className="command-options mb-0">
                            {this.state.options.map((opt) => {
                                return <span key={opt.label} className="command-options__option" onClick={() => this.selectOption(opt)}>{opt.label}</span>
                            })}
                        </p>
                    </div>
                    <div className="">
                        <p className="mt-18 mb-8 ml-8 mr-8">Jump to</p>
                        {this.state.suggestedCommands.map((s) => {
                            return <article className="suggested-command p-8" onClick={(event) => this.selectSuggestedCommand(s)}>
                                <Arrow className="scn-4" />
                                <div>
                                    <p className="m-0">{s.title}</p>
                                    <p className="m-0">{s.desc}</p>
                                </div>
                            </article>
                        })}
                    </div>
                </div>
            </div>
        }
        return null;
    }
}