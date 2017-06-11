/* @flow */
import warning from 'warning'
import type StyleSheet from './StyleSheet'
import type {Plugin, Rule, RuleOptions, JssStyle} from './types'
import RegularRule from './plugins/RegularRule'

export default class PluginsRegistry {
  hooks: {[key: string]: Array<Function>} = {
    onCreateRule: [],
    onProcessRule: [],
    onProcessStyle: [],
    onProcessSheet: [],
    onChangeValue: []
  }

  /**
   * Call `onCreateRule` hooks and return an object if returned by a hook.
   */
  onCreateRule(name?: string, decl: JssStyle, options: RuleOptions): Rule|null {
    for (let i = 0; i < this.hooks.onCreateRule.length; i++) {
      const rule = this.hooks.onCreateRule[i](name, decl, options)
      if (rule) return rule
    }
    return null
  }

  /**
   * Call `onProcessRule` hooks.
   */
  onProcessRule(rule: Rule): void {
    if (rule.isProcessed) return
    const {sheet} = rule.options
    for (let i = 0; i < this.hooks.onProcessRule.length; i++) {
      this.hooks.onProcessRule[i](rule, sheet)
    }

    // TODO
    // Find a way to use rule.type with flow
    if (rule instanceof RegularRule) this.onProcessStyle(rule.style, rule, sheet)
    rule.isProcessed = true
  }

  /**
   * Call `onProcessStyle` hooks.
   */
  onProcessStyle(style: JssStyle, rule: Rule, sheet?: StyleSheet): void {
    // TODO
    // Only added because of flow.
    if (!(rule instanceof RegularRule)) return
    for (let i = 0; i < this.hooks.onProcessStyle.length; i++) {
      rule.style = style = this.hooks.onProcessStyle[i](style, rule, sheet)
    }
  }

  /**
   * Call `onProcessSheet` hooks.
   */
  onProcessSheet(sheet: StyleSheet): void {
    for (let i = 0; i < this.hooks.onProcessSheet.length; i++) {
      this.hooks.onProcessSheet[i](sheet)
    }
  }

  /**
   * Call `onChangeValue` hooks.
   */
  onChangeValue(value: string, prop: string, rule: Rule): string {
    let processedValue = value
    for (let i = 0; i < this.hooks.onChangeValue.length; i++) {
      processedValue = this.hooks.onChangeValue[i](processedValue, prop, rule)
    }
    return processedValue
  }

  /**
   * Register a plugin.
   * If function is passed, it is a shortcut for `{onProcessRule}`.
   */
  use(plugin: Plugin): void {
    for (const name in plugin) {
      if (this.hooks[name]) this.hooks[name].push(plugin[name])
      else warning(false, '[JSS] Unknown hook "%s".', name)
    }
  }
}
