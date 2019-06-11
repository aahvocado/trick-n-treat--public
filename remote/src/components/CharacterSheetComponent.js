import React, {PureComponent} from 'react';

import GameIconComponent from 'components/GameIconComponent';

import {STAT_ID} from 'constants.shared/statIds';

import combineClassNames from 'utilities/combineClassNames';

/**
 *
 */
export default class CharacterSheetComponent extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-col bor-1-gray pad-1',
    /** @type {String} */
    className: '',
    /** @type {CharacterData} */
    characterData: {},
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      characterData,
      // ...otherProps
    } = this.props;

    const {
      health,
      movement,
      sanity,
      vision,
      candies,
      tricky,
      treaty,
      luck,
      greed,
      position,
    } = characterData;

    return (
      <div
        className={combineClassNames(baseClassName, className)}
      >
        <CharacterSheetRow
          label='health'
          value={health}
          statId={STAT_ID.HEALTH}
        />

        <CharacterSheetRow
          label='movement'
          value={movement}
          statId={STAT_ID.MOVEMENT}
        />

        <CharacterSheetRow
          label='sanity'
          value={sanity}
          statId={STAT_ID.SANITY}
        />

        <CharacterSheetRow
          label='vision'
          value={vision}
          statId={STAT_ID.VISION}
        />

        <CharacterSheetRow
          label='candies'
          value={candies}
          statId={STAT_ID.CANDIES}
        />

        <CharacterSheetRow
          label='tricky'
          value={tricky}
          statId={STAT_ID.TRICKY}
        />

        <CharacterSheetRow
          label='treaty'
          value={treaty}
          statId={STAT_ID.TREATY}
        />

        <CharacterSheetRow
          label='luck'
          value={luck}
          statId={STAT_ID.LUCK}
        />

        <CharacterSheetRow
          label='greed'
          value={greed}
          statId={STAT_ID.GREED}
        />

        <CharacterSheetRow
          label='position'
          value={`x: ${position.x}, y: ${position.y}`}
          statId={STAT_ID.POSITION}
        />
      </div>
    )
  }
}
/**
 *
 */
export class CharacterSheetRow extends PureComponent {
  static defaultProps = {
    /** @type {String} */
    baseClassName: 'flex-row-center',
    /** @type {String} */
    className: '',
    /** @type {String} */
    label: '',
    /** @type {String} */
    statId: '',
    /** @type {String} */
    value: '',
  }
  /** @override */
  render() {
    const {
      baseClassName,
      className,
      label,
      statId,
      value,
      // ...otherProps
    } = this.props;

    return (
      <div
        className={combineClassNames(baseClassName, className)}
      >
        <span className='talign-left flex-auto adjacent-mar-l-2'>{label}</span>
        <span className='flex-none fsize-4 adjacent-mar-l-2'>{value}</span>
        <GameIconComponent
          className='flex-none adjacent-mar-l-2'
          statId={statId}
          style={{width: '30px'}}
        />
      </div>
    )
  }
}
